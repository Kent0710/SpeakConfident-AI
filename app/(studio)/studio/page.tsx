"use client";

import React, {
    Suspense,
    useEffect,
    useRef,
    useState,
    useCallback,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useRecorder } from "@/hooks/use-recorder";
import { useFileStore } from "@/store/use-current-file";
import { useAnalysisResultStore } from "@/store/use-analysis-result";
import { AnalysisResultType } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import PreviewOverlay from "@/components/studio/preview-overlay";
import CameraRig from "@/components/studio/camera-rig";
import ChairRows from "@/components/studio/chair-rows";
import Curtain from "@/components/studio/curtain";
import CurtainRod from "@/components/studio/curtain-rod";
import CountdownOverlay from "@/components/studio/countdown-overlay";
import RecordingHUD from "@/components/studio/recording-hud";
import ModeSelect from "@/components/studio/mode-select";

// Types

type PagePhase =
    | "mode-select" // user picks video/audio + countdown duration
    | "countdown" // 3-2-1 countdown (curtains still closed)
    | "recording" // live — curtains open, HUD visible
    | "closing" // stop pressed — curtains closing, waiting for blob
    | "preview"; // blob ready — show review UI

// z-index map (documented for sanity):
// canvas        : 0   (default, behind everything)
// curtains      : 50
// countdown     : 65  (above curtains so it shows during countdown phase)
// hud           : 65
// rod            : 70
// mode-select   : 80
// preview       : 80
// error         : 90

const CURTAIN_CLOSE_DURATION = 2200; // ms — matches CSS transition

const Loader = () => (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#555" wireframe />
    </mesh>
);

const RecordPresentationPage = () => {
    const router = useRouter();
    const { setCurrentFile } = useFileStore();
    const { setAnalysisResult } = useAnalysisResultStore();

    const [rowBox, setRowBox] = useState<THREE.Box3 | null>(null);
    const [curtainsOpen, setCurtainsOpen] = useState(false);
    const [phase, setPhase] = useState<PagePhase>("mode-select");
    const [countdownDuration, setCountdownDuration] = useState(3);
    const [countdownTick, setCountdownTick] = useState(3);
    const [elapsed, setElapsed] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isSubmittingRef = useRef(false);

    const {
        mode,
        setMode,
        previewUrl,
        recordedBlob,
        videoRef, // ← the ref the hook assigns srcObject to
        streamRef,
        startRecording,
        stopRecording,
        reset,
        error,
    } = useRecorder();

    const handleSceneReady = useCallback(
        (box: THREE.Box3) => setRowBox(box),
        [],
    );

    // ── Start: acquire stream first, then countdown (or go straight to recording)
    const handleStart = useCallback(async () => {
        await startRecording(); // acquires stream & starts MediaRecorder

        if (countdownDuration === 0) {
            setCurtainsOpen(true);
            setPhase("recording");
            elapsedTimerRef.current = setInterval(
                () => setElapsed((e) => e + 1),
                1000,
            );
        } else {
            setCountdownTick(countdownDuration);
            setPhase("countdown");
        }
    }, [countdownDuration, startRecording]);

    // ── Countdown tick
    useEffect(() => {
        if (phase !== "countdown") return;

        if (countdownTick <= 0) {
            setCurtainsOpen(true);
            setPhase("recording");
            elapsedTimerRef.current = setInterval(
                () => setElapsed((e) => e + 1),
                1000,
            );
            return;
        }

        const t = setTimeout(() => setCountdownTick((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [phase, countdownTick]);

    // ── Stop: close curtains, enter "closing" phase
    // Preview phase is only entered AFTER curtains finish closing + blob is ready
    const handleStop = useCallback(() => {
        stopRecording(); // triggers recorder.onstop → blob + previewUrl set async
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        setCurtainsOpen(false);
        setPhase("closing"); // curtains closing, waiting for blob
    }, [stopRecording]);

    // ── FIX: watch for previewUrl + "closing" phase together
    // Only transition to preview once BOTH curtains have fully closed
    // AND the blob is ready (previewUrl is set by recorder.onstop)
    useEffect(() => {
        if (phase !== "closing" || !previewUrl) return;

        // Wait for curtain close transition to complete before showing preview
        const t = setTimeout(() => setPhase("preview"), CURTAIN_CLOSE_DURATION);
        return () => clearTimeout(t);
    }, [phase, previewUrl]);

    // ── Reset
    const handleReset = useCallback(() => {
        reset();
        setElapsed(0);
        setCurtainsOpen(false);
        setPhase("mode-select");
    }, [reset]);

    // ── Submit
    const handleSubmit = useCallback(async () => {
        if (!recordedBlob || isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        try {
            const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
            const filename = `recording-${Date.now()}.${ext}`;
            const file = new File([recordedBlob], filename, {
                type: recordedBlob.type,
            });

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
            router.push("/analysis/123");
        } catch (err: unknown) {
            console.error("[RecordPage] submit error:", err);
            toast.error(
                err instanceof Error
                    ? `Analysis failed: ${err.message}`
                    : "Unknown error.",
            );
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    }, [recordedBlob, setCurrentFile, setAnalysisResult, router]);

    // ── Cleanup
    useEffect(
        () => () => {
            if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        },
        [],
    );

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                background: "#0a0a0a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                overflow: "hidden",
                paddingTop: 20,
            }}
        >
            <p
                style={{
                    color: "#555",
                    fontSize: 11,
                    letterSpacing: 3,
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    margin: 0,
                }}
            >
                SpeakConfident AI — Presentation Stage
            </p>

            {/* ── Main stage ── */}
            <div className="w-full h-full relative">
                {/* Rod always on top */}
                <CurtainRod />

                {/* Curtains */}
                <Curtain side="left" open={curtainsOpen} />
                <Curtain side="right" open={curtainsOpen} />

                {/* Mode select — above curtains */}
                {phase === "mode-select" && (
                    <ModeSelect
                        mode={mode}
                        setMode={setMode}
                        countdown={countdownDuration}
                        setCountdown={setCountdownDuration}
                        onStart={handleStart}
                    />
                )}

                {/* Countdown — ABOVE curtains so it's visible */}
                {phase === "countdown" && (
                    <CountdownOverlay count={countdownTick} />
                )}

                {/* Recording HUD — above the open curtain slivers */}
                {phase === "recording" && (
                    <RecordingHUD
                        mode={mode}
                        videoRef={videoRef} // same ref the hook wrote srcObject to
                        streamRef={streamRef}
                        onStop={handleStop}
                        elapsed={elapsed}
                    />
                )}

                {/* Preview — only shown after curtains fully closed + blob ready */}
                {phase === "preview" && previewUrl && (
                    <PreviewOverlay
                        mode={mode}
                        previewUrl={previewUrl}
                        onReset={handleReset}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}

                {/* Error */}
                {error && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: 20,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 90,
                            background: "#7f1d1d",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: 10,
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Three.js canvas — behind everything */}
                <Canvas
                    camera={{ position: [0, 5, 20], fov: 50 }}
                    shadows
                    gl={{
                        antialias: true,
                        outputColorSpace: THREE.SRGBColorSpace,
                    }}
                >
                    <ambientLight intensity={0.6} />
                    <directionalLight
                        position={[5, 10, 5]}
                        intensity={1.5}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                    />
                    <pointLight
                        position={[-6, 5, -4]}
                        intensity={0.8}
                        color="#a78bfa"
                    />
                    <pointLight
                        position={[6, 5, -4]}
                        intensity={0.8}
                        color="#60a5fa"
                    />

                    <Suspense fallback={<Loader />}>
                        <ChairRows onReady={handleSceneReady} />
                        {rowBox && <CameraRig box={rowBox} />}
                        <ContactShadows
                            position={[0, -0.01, 0]}
                            opacity={0.5}
                            scale={30}
                            blur={2}
                        />
                        <Environment preset="lobby" />
                    </Suspense>
                </Canvas>
            </div>
        </div>
    );
};

export default RecordPresentationPage;
