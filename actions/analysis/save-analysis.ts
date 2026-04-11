'use server'

import { AnalysisResultType } from "@/types";
import { createClient } from "@/lib/supabase/server";

export default async function saveAnalysis(result: AnalysisResultType) {
    try {
        const supabase = await createClient();

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { ok: false, error: "User not authenticated." };
        }

        // The database schema uses flattened columns for the arrays of metrics,
        // so we'll serialize the text arrays to JSON strings.
        const audioScore = result.metrics.length > 0 
            ? JSON.stringify(result.metrics.map(m => m.score)) 
            : null;
            
        const visualMetrics = result.visualAnalysis?.metrics || [];
        const visualScore = visualMetrics.length > 0
            ? JSON.stringify(visualMetrics.map(m => m.score))
            : null;

        const { data, error } = await supabase.from('analysis').insert({
            overallScore: result.overallScore,
            summary: result.summary,
            audio_metric_category: JSON.stringify(result.metrics.map(m => m.category)),
            audio_score: audioScore,
            audio_feedback: JSON.stringify(result.metrics.map(m => m.feedback)),
            visual_general_feedback: result.visualAnalysis?.generalFeedback || null,
            visual_label: JSON.stringify(visualMetrics.map(m => m.label)),
            visual_score: visualScore,
            visual_feedback: JSON.stringify(visualMetrics.map(m => m.feedback)),
            strengths: result.strengths,
            improvements: result.improvements,
            transcriptionSnippet: result.transcriptionSnippet,
            recording_url: result.recording_url || null,
            user_id: user.id
        }) .select('id').single();

        if (error) {
            console.error("Supabase insert error:", error);
            return { ok: false, error: "Database error: Failed to save analysis result." };
        }

        return { ok: true, id: data.id };
    } catch (error) {
        console.error("Error saving analysis result:", error);
        return {
            ok: false,
            error: "Failed to save analysis result. Please try again later."
        }
    }
}