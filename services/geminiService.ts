import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash"; // Supports multimodal input (video/audio)
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

// Helper to convert file to Base64
const fileToGenerativePart = async (
    file: File,
): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data url prefix (e.g. "data:image/jpeg;base64,")
            const base64Data = base64String.split(",")[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const analyzePresentation = async (
    file: File,
): Promise<AnalysisResult> => {
    if (!GEMINI_API_KEY) {
        throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const filePart = await fileToGenerativePart(file);
    const isVideo = file.type.startsWith("video/");

    let prompt = `
    You are a world-class public speaking coach designed to help students sound confident.
    Analyze the provided ${isVideo ? "video" : "audio"} clip of a presentation.
    
    Evaluate the speaker on the following criteria:
    1. Confidence (Tone, volume, steadiness)
    2. Clarity (Enunciation, speed/pacing)
    3. Engagement (Intonation, emotion, avoiding monotone)
    4. Content Structure (Logic, flow - if enough context exists)
    5. Filler Words (Usage of 'um', 'uh', 'like')
  `;

    if (isVideo) {
        prompt += `
    \nSince this is a video, strictly evaluate the visual presence as well:
    6. Eye Contact (Consistent connection with camera/audience)
    7. Body Language (Posture, openness, stability)
    8. Gestures (Natural, emphatic vs distracting/absent)
    9. Facial Expressions (Smiling, matching content)
    `;
    }

    prompt += `
    Provide a constructive, encouraging, but honest assessment.
    Return the response in strict JSON format.
  `;

    // Define Schema
    const schemaProperties: any = {
        overallScore: {
            type: Type.NUMBER,
            description: "Overall score from 0-100",
        },
        summary: {
            type: Type.STRING,
            description: "A 2-3 sentence summary of the performance.",
        },
        transcriptionSnippet: {
            type: Type.STRING,
            description:
                "A short snippet of what was said (first few sentences).",
        },
        metrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
                },
                required: ["category", "score", "feedback"],
            },
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
    };

    const requiredFields = [
        "overallScore",
        "summary",
        "metrics",
        "strengths",
        "improvements",
        "transcriptionSnippet",
    ];

    if (isVideo) {
        schemaProperties.visualAnalysis = {
            type: Type.OBJECT,
            properties: {
                generalFeedback: {
                    type: Type.STRING,
                    description: "Overall feedback on visual presence.",
                },
                metrics: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: {
                                type: Type.STRING,
                                description: "e.g., Eye Contact, Body Language",
                            },
                            score: { type: Type.NUMBER },
                            feedback: { type: Type.STRING },
                        },
                        required: ["label", "score", "feedback"],
                    },
                },
            },
            required: ["generalFeedback", "metrics"],
        };
        requiredFields.push("visualAnalysis");
    }

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [filePart, { text: prompt }],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: schemaProperties,
                    required: requiredFields,
                },
            },
        });

        if (!response.text) {
            throw new Error("No response from AI");
        }

        const result = JSON.parse(response.text) as AnalysisResult;
        return result;
    } catch (error) {
        // If the error is related to model capabilities, try fallback
        if (
            error instanceof Error &&
            error.message.includes("model does not support the provided input")
        ) {
            console.warn(
                `Model ${MODEL_NAME} does not support the input. Retrying with fallback model ${FALLBACK_MODEL}.`,
            );
            try {
                const fallbackResponse = await ai.models.generateContent({
                    model: FALLBACK_MODEL,
                    contents: {
                        parts: [filePart, { text: prompt }],
                    },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: schemaProperties,
                            required: requiredFields,
                        },
                    },
                });

                if (!fallbackResponse.text) {
                    throw new Error("No response from AI on fallback model");
                }

                const fallbackResult = JSON.parse(
                    fallbackResponse.text,
                ) as AnalysisResult;
                return fallbackResult;
            } catch (fallbackError) {
                console.error("Fallback model also failed:", fallbackError);
                throw new Error(
                    "Both primary and fallback models failed to process the input.",
                );
            }
        } else {
            console.error("Error during analysis:", error);
            throw error;
        }
    }
};
