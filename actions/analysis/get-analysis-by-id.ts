'use server'

import { AnalysisResultType } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function getAnalysisById(analysisId: string) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect("/login");
        }

        const { data: row, error } = await supabase
            .from("analysis")
            .select("*")
            .eq("id", analysisId)
            .single();

        if (error) {
            console.error("Supabase fetch error:", error);
            throw new Error(error.message);
        }

        if (!row) {
            return { ok: false, error: "Analysis not found." };
        }

        const audioCategories = row.audio_metric_category ? JSON.parse(row.audio_metric_category) : [];
        const audioFeedbacks = row.audio_feedback ? JSON.parse(row.audio_feedback) : [];
        const audioScores = row.audio_score ? JSON.parse(row.audio_score) : [];
        
        const metrics = audioCategories.map((category: string, index: number) => ({
            category,
            score: audioScores[index] !== undefined ? audioScores[index] : 0,
            feedback: audioFeedbacks[index] || ""
        }));

        const visualLabels = row.visual_label ? JSON.parse(row.visual_label) : [];
        const visualFeedbacks = row.visual_feedback ? JSON.parse(row.visual_feedback) : [];
        const visualScores = row.visual_score ? JSON.parse(row.visual_score) : [];

        const visualMetrics = visualLabels.map((label: string, index: number) => ({
            label,
            score: visualScores[index] !== undefined ? visualScores[index] : 0,
            feedback: visualFeedbacks[index] || ""
        }));

        const visualAnalysis = (row.visual_general_feedback || visualMetrics.length > 0) 
            ? { 
                generalFeedback: row.visual_general_feedback || "", 
                metrics: visualMetrics 
              } 
            : undefined;

        const result: AnalysisResultType = {
            id: row.id,
            name: row.name || undefined,
            description: row.description || undefined,
            overallScore: row.overallScore || 0,
            summary: row.summary || "",
            metrics,
            strengths: row.strengths || [],
            improvements: row.improvements || [],
            transcriptionSnippet: row.transcriptionSnippet || "",
            recording_url: row.recording_url || undefined,
            timestampFeedback: row.timestamp_feedback ? JSON.parse(row.timestamp_feedback) : undefined,
        };

        if (visualAnalysis) {
            result.visualAnalysis = visualAnalysis;
        }

        return {
            ok: true,
            data: result
        };

    } catch (error) {
        console.error("Error fetching analysis:", error);
        return {
            ok: false,
            error: "Failed to fetch analysis. Please try again later."
        }
    }
}