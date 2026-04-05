"use client";

import { FileUpload } from "@/components/file-upload";
import PageWrapper from "@/components/reusables/wrappers";
import { useFileStore } from "@/store/use-current-file";
import { useAnalysisResultStore } from "@/store/use-analysis-result";
import { AnalysisResultType, UploadFileType } from "@/types";
import saveAnalysis from "@/actions/analysis/save-analysis";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const UploadPage = () => {
    const router = useRouter();
    const { setCurrentFile } = useFileStore();
    const { setAnalysisResult } = useAnalysisResultStore();

    const handleFileSelect = async (fileData: UploadFileType) => {
        if (!fileData) {
            toast.error("No file selected. Please try again.");
            return;
        }

        // Persist the file metadata to the store for use on the analysis page
        setCurrentFile(fileData);

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

            setAnalysisResult(result);

            const res = await saveAnalysis(result);
            if (res.ok) {
                router.push(`/analysis/${res.id}`);
            } else {
                toast.error(res.error);
            }
        } catch (err: unknown) {
            console.error("[UploadPage] handleFileSelect error:", err);

            if (err instanceof Error) {
                toast.error(`Analysis failed: ${err.message}`);
            } else {
                toast.error("An unknown error occurred during analysis.");
            }
        }
    };

    return (
        <PageWrapper
            title="Upload File"
            description="Lorem ipsum dolor sit amet consectetur, adipisicing elit."
        >
            <FileUpload onFileSelect={handleFileSelect} />
        </PageWrapper>
    );
};

export default UploadPage;