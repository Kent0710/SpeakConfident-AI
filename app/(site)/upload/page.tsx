"use client";

import { FileUpload } from "@/components/file-upload";
import PageWrapper from "@/components/reusables/wrappers";
import { useFileStore } from "@/store/use-current-file";
import { useAnalysisResultStore } from "@/store/use-analysis-result";
import { AnalysisResultType, UploadFileType } from "@/types";
import saveAnalysis from "@/actions/analysis/save-analysis";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const UploadPage = () => {
    const router = useRouter();
    const { setCurrentFile } = useFileStore();
    const { setAnalysisResult } = useAnalysisResultStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileSelect = async (fileData: UploadFileType) => {
        if (!fileData) {
            toast.error("No file selected. Please try again.");
            return;
        }

        // Persist the file metadata to the store for use on the analysis page
        setCurrentFile(fileData);
        setIsAnalyzing(true);

        try {
            // Build FormData so the file is streamed to the API route
            // without hitting Next.js server action body-size limits
            const formData = new FormData();
            formData.append("file", fileData.file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                // Do NOT set Content-Type — the browser sets it automatically
                // with the correct multipart boundary
            });

            if (!response.ok) {
                // Surface the error message returned by the API route
                const { error } = (await response.json()) as { error: string };
                throw new Error(error ?? `Server error: ${response.status}`);
            }

            const result = (await response.json()) as AnalysisResultType;

            // Upload to Supabase Storage
            const ext = fileData.file.name.split('.').pop() || "mp4";
            const filename = `upload-${Date.now()}.${ext}`;
            const supabase = createClient();
            
            const { error: uploadError } = await supabase.storage
                .from("recordings")
                .upload(filename, fileData.file);

            if (uploadError) {
                console.error("Supabase upload error:", uploadError);
                toast.error("Failed to upload recording, but analysis was completed.");
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from("recordings")
                    .getPublicUrl(filename);
                result.recording_url = publicUrl;
            }

            setAnalysisResult(result);

            const res = await saveAnalysis(result);
            if (res.ok) {
                router.push(`/analysis/${res.id}`);
                return;
            } else {
                toast.error(res.error);
                setIsAnalyzing(false);
            }
        } catch (err: unknown) {
            console.error("[UploadPage] handleFileSelect error:", err);

            if (err instanceof Error) {
                toast.error(`Analysis failed: ${err.message}`);
            } else {
                toast.error("An unknown error occurred during analysis.");
            }
            setIsAnalyzing(false);
        }
    };

    return (
        <PageWrapper
            title="Upload File"
            description="Upload your video or audio recording for AI-powered public speaking feedback."
        >
            {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center border bg-card p-12 rounded-2xl shadow-sm w-full mt-4 h-64">
                    <div className="text-4xl animate-bounce mb-4">✨</div>
                    <h2 className="text-lg font-semibold mb-2">Analyzing your presentation...</h2>
                    <p className="text-muted-foreground text-sm text-center max-w-sm">
                        Our AI is reviewing your delivery, confidence, and pacing. This may take a minute.
                    </p>
                </div>
            ) : (
                <FileUpload onFileSelect={handleFileSelect} />
            )}
        </PageWrapper>
    );
};

export default UploadPage;