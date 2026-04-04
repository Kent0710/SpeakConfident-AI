"use client";

import { useCallback, useRef, useState } from "react";

export type CaptureMode = "audio" | "video";
export type RecorderStatus = "idle" | "requesting" | "recording" | "preview";

interface UseRecorderReturn {
    status: RecorderStatus;
    mode: CaptureMode;
    setMode: (mode: CaptureMode) => void;
    previewUrl: string | null;
    recordedBlob: Blob | null;
    streamRef: React.RefObject<MediaStream | null>;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    reset: () => void;
    error: string | null;
}

export const useRecorder = (): UseRecorderReturn => {
    const [status, setStatus] = useState<RecorderStatus>("idle");
    const [mode, setMode] = useState<CaptureMode>("video");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const startRecording = useCallback(async () => {
        setError(null);
        setStatus("requesting");

        try {
            const constraints: MediaStreamConstraints =
                mode === "video"
                    ? { video: true, audio: true }
                    : { audio: true };

            const stream =
                await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            // Show live preview in the video element
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true; // prevent feedback during recording
                videoRef.current.play();
            }

            // Pick the best supported MIME type
            const mimeType = getSupportedMimeType(mode);
            const recorder = new MediaRecorder(
                stream,
                mimeType ? { mimeType } : {},
            );
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: mimeType || recorder.mimeType,
                });
                const url = URL.createObjectURL(blob);

                setRecordedBlob(blob);
                setPreviewUrl(url);
                setStatus("preview");

                // Detach live stream from video element — preview src is set by the component
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }

                // Stop all tracks so the camera/mic indicator goes away
                stream.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            };

            recorder.start(250); // collect chunks every 250ms
            setStatus("recording");
        } catch (err) {
            console.error("[useRecorder] startRecording error:", err);
            setStatus("idle");

            if (err instanceof DOMException) {
                if (err.name === "NotAllowedError") {
                    setError(
                        "Permission denied. Please allow camera/microphone access.",
                    );
                } else if (err.name === "NotFoundError") {
                    setError("No camera or microphone found on this device.");
                } else {
                    setError(`Device error: ${err.message}`);
                }
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    }, [mode]);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
    }, []);

    const reset = useCallback(() => {
        // Clean up object URL to avoid memory leaks
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        // Stop any lingering tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        setStatus("idle");
        setPreviewUrl(null);
        setRecordedBlob(null);
        setError(null);
        chunksRef.current = [];
    }, [previewUrl]);

    return {
        status,
        mode,
        setMode,
        previewUrl,
        recordedBlob,
        streamRef,
        videoRef,
        startRecording,
        stopRecording,
        reset,
        error,
    };
};

const VIDEO_MIME_TYPES = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
];

const AUDIO_MIME_TYPES = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
];

function getSupportedMimeType(mode: CaptureMode): string | null {
    const candidates = mode === "video" ? VIDEO_MIME_TYPES : AUDIO_MIME_TYPES;
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}
