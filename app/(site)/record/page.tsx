"use client";

import { useRecorder, CaptureMode } from "@/hooks/use-recorder";
import PageWrapper from "@/components/reusables/wrappers";
import { useFileStore } from "@/store/use-current-file";
import { useAnalysisResultStore } from "@/store/use-analysis-result";
import { AnalysisResultType } from "@/types";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";

const MODES: {
    value: CaptureMode;
    label: string;
    icon: string;
    hint: string;
}[] = [
    {
        value: "video",
        label: "Video & Audio",
        icon: "🎥",
        hint: "Records your camera and microphone",
    },
    {
        value: "audio",
        label: "Audio Only",
        icon: "🎙️",
        hint: "Records your microphone only",
    },
];

const RecordPage = () => {
    const router = useRouter();
    const { setCurrentFile } = useFileStore();
    const { setAnalysisResult } = useAnalysisResultStore();
    const isSubmittingRef = useRef(false);

    const {
        status,
        mode,
        setMode,
        previewUrl,
        recordedBlob,
        videoRef,
        startRecording,
        stopRecording,
        reset,
        error,
    } = useRecorder();

    const handleSubmit = async () => {
        if (!recordedBlob || isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        try {
            const extension = recordedBlob.type.includes("mp4")
                ? "mp4"
                : "webm";
            const filename = `recording-${Date.now()}.${extension}`;
            const file = new File([recordedBlob], filename, {
                type: recordedBlob.type,
            });

            // Persist lightweight metadata to the store (no raw File — it can be large)
            setCurrentFile({ file, name: filename, type: recordedBlob.type });

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const { error: serverError } = (await response.json()) as {
                    error: string;
                };
                throw new Error(
                    serverError ?? `Server error: ${response.status}`,
                );
            }

            const result = (await response.json()) as AnalysisResultType;
            setAnalysisResult(result);

            // TODO: replace hardcoded ID once DB server action is ready
            router.push("/analysis/123");
        } catch (err: unknown) {
            console.error("[RecordPage] handleSubmit error:", err);
            toast.error(
                err instanceof Error
                    ? `Analysis failed: ${err.message}`
                    : "An unknown error occurred during analysis.",
            );
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const isIdle = status === "idle";
    const isRequesting = status === "requesting";
    const isRecording = status === "recording";
    const isPreview = status === "preview";

    return (
        <PageWrapper
            title="Record Presentation"
            description="Record yourself presenting and get instant AI feedback."
        >
            <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
                {/* ── Mode selector (only visible before recording starts) ── */}
                {isIdle && (
                    <div className="flex gap-3 w-full">
                        {MODES.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setMode(m.value)}
                                className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all
                                    ${
                                        mode === m.value
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                                    }`}
                            >
                                <span className="text-2xl">{m.icon}</span>
                                <span className="font-semibold text-sm">
                                    {m.label}
                                </span>
                                <span className="text-xs text-center opacity-70">
                                    {m.hint}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Live camera / audio visualiser area ── */}
                {(isRecording || isRequesting || isIdle) && (
                    <div className="relative w-full aspect-video bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
                        {mode === "video" ? (
                            /* Live video feed */
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                playsInline
                            />
                        ) : (
                            /* Audio-only placeholder */
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                <span className="text-6xl">
                                    {isRecording ? "🔴" : "🎙️"}
                                </span>
                                <p className="text-sm font-medium">
                                    {isRecording
                                        ? "Recording audio…"
                                        : "Audio mode"}
                                </p>
                            </div>
                        )}

                        {/* Recording badge */}
                        {isRecording && (
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                REC
                            </div>
                        )}
                    </div>
                )}

                {/* ── Preview player ── */}
                {isPreview && previewUrl && (
                    <div className="w-full rounded-2xl overflow-hidden bg-muted">
                        {mode === "video" ? (
                            <video
                                src={previewUrl}
                                controls
                                className="w-full aspect-video object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-4 p-8">
                                <span className="text-5xl">🎙️</span>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Preview your recording
                                </p>
                                <audio
                                    src={previewUrl}
                                    controls
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ── Error message ── */}
                {error && (
                    <p className="text-sm text-destructive text-center">
                        {error}
                    </p>
                )}

                {/* ── Controls ── */}
                <div className="flex gap-3 w-full">
                    {/* Start */}
                    {isIdle && (
                        <button
                            onClick={startRecording}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                        >
                            <span>⏺</span>
                            Start Recording
                        </button>
                    )}

                    {/* Requesting permission */}
                    {isRequesting && (
                        <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-muted-foreground font-semibold cursor-not-allowed">
                            <span className="animate-spin">⏳</span>
                            Requesting permission…
                        </div>
                    )}

                    {/* Stop */}
                    {isRecording && (
                        <button
                            onClick={stopRecording}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors"
                        >
                            <span>⏹</span>
                            Stop Recording
                        </button>
                    )}

                    {/* Preview actions */}
                    {isPreview && (
                        <>
                            <button
                                onClick={reset}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors"
                            >
                                <span>🔄</span>
                                Re-record
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                            >
                                <span>✨</span>
                                Analyze Recording
                            </button>
                        </>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default RecordPage;
