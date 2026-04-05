'use server'

import { AnalysisResultType } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tables } from "@/database.types";

export default async function getAnalyses() {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect("/login");
        }

        const id = user.id;

        const { data, error } = await supabase
            .from("analysis")
            .select("*")
            .eq("user_id", id);

        if (error) {
            console.error("Supabase fetch error:", error);
            throw new Error(error.message);
        }

        const analyses: AnalysisResultType[] = data.map((row: Tables<"analysis">) => {
            const audioCategories = row.audio_metric_category ? JSON.parse(row.audio_metric_category) : [];
            const audioFeedbacks = row.audio_feedback ? JSON.parse(row.audio_feedback) : [];
            
            const metrics = audioCategories.map((category: string, index: number) => ({
                category,
                score: row.audio_score || 0,
                feedback: audioFeedbacks[index] || ""
            }));

            const visualLabels = row.visual_label ? JSON.parse(row.visual_label) : [];
            const visualFeedbacks = row.visual_feedback ? JSON.parse(row.visual_feedback) : [];

            const visualMetrics = visualLabels.map((label: string, index: number) => ({
                label,
                score: row.visual_score || 0,
                feedback: visualFeedbacks[index] || ""
            }));

            const visualAnalysis = (row.visual_general_feedback || visualMetrics.length > 0) 
                ? { 
                    generalFeedback: row.visual_general_feedback || "", 
                    metrics: visualMetrics 
                  } 
                : undefined;

            const result: AnalysisResultType = {
                overallScore: row.overallScore || 0,
                summary: row.summary || "",
                metrics,
                strengths: row.strengths || [],
                improvements: row.improvements || [],
                transcriptionSnippet: row.transcriptionSnippet || ""
            };

            if (visualAnalysis) {
                result.visualAnalysis = visualAnalysis;
            }

            return result;
        });

        return {
            ok: true,
            data: analyses
        };

    } catch (error) {
        console.error("Error fetching analyses:", error);
        return {
            ok: false,
            error: "Failed to fetch analyses. Please try again later."
        }
    }
}