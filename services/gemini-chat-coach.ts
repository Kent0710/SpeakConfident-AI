import { GoogleGenAI } from "@google/genai";
import { AnalysisResultType } from "@/types";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getChatCoachResponse(messages: ChatMessage[], context: AnalysisResultType) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
    
    // We simplify context to keep prompt succinct
    const systemPrompt = `You are a friendly, encouraging AI Speech Coach. 
You are given the following analysis of a user's presentation:
Score: ${context.overallScore}/100
Summary: ${context.summary}
Strengths: ${context.strengths.join(", ")}
Improvements: ${context.improvements.join(", ")}

Help the user improve their presentation skills based on this analysis. Be highly constructive, brief, and actionable. Answer queries related only to speech, presentation, and the provided feedback.`;

    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Insert system prompt directly if the model supports it or prepend it
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedMessages,
        config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
        }
    });

    return response.text || "I'm having trouble processing that right now.";
  } catch (error) {
    console.error("Gemini Chat Coach Error:", error);
    throw new Error("Failed to generate chat response.");
  }
}
