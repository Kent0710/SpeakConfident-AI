'use server'

import { createClient } from "@/lib/supabase/server"

export default async function saveTitleAndDescription(analysisId: string, title: string, description: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('analysis')
        .update({ name: title, description })
        .eq('id', analysisId);

    if (error) {
        console.error("Error updating analysis:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}