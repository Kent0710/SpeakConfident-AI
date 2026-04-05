"use client";

import React, {
    Suspense,
    useEffect,
    useRef,
    useState,
    useCallback,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
    useGLTF,
    OrbitControls,
    Environment,
    ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { useRecorder, CaptureMode } from "@/hooks/use-recorder";
import { useFileStore } from "@/store/use-current-file";
import { useAnalysisResultStore } from "@/store/use-analysis-result";
import { AnalysisResultType } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type PagePhase =
    | "mode-select"  // user picks video/audio + countdown duration
    | "countdown"    // 3-2-1 countdown (curtains still closed)
    | "recording"    // live — curtains open, HUD visible
    | "closing"      // stop pressed — curtains closing, waiting for blob
    | "preview";     // blob ready — show review UI

// z-index map (documented for sanity):
// canvas        : 0   (default, behind everything)
// curtains      : 50
// countdown     : 65  (above curtains so it shows during countdown phase)
// hud           : 65
// rod            : 70
// mode-select   : 80
// preview       : 80
// error         : 90

// ============================================================================
// Three.js — Camera rig
// ============================================================================

const CameraRig = ({ box }: { box: THREE.Box3 }) => {
    const { camera, controls } = useThree();

    useEffect(() => {
        if (box.isEmpty()) return;
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        const cam = camera as THREE.PerspectiveCamera;
        const fov = cam.fov * (Math.PI / 180);
        const fitH = size.y / (2 * Math.tan(fov / 2));
        const fitW = size.x / (2 * Math.tan(fov / 2) * cam.aspect);
        const distance = Math.max(fitH, fitW) * 1.5;

        camera.position.set(center.x, center.y + size.y * 0.5 + 30, center.z + distance);

        if (controls) {
            // @ts-expect-error – OrbitControls types
            controls.target.copy(center);
            // @ts-expect-error – OrbitControls types
            controls.update();
        } else {
            camera.lookAt(center);
        }
        camera.updateProjectionMatrix();
    }, [box, camera, controls]);

    return null;
};

// ============================================================================
// Three.js — Cinema chair
// ============================================================================

interface ChairProps {
    position: [number, number, number];
    onLoad?: (box: THREE.Box3) => void;
}

const CinemaChair = ({ position, onLoad }: ChairProps) => {
    const { scene } = useGLTF("/models/cinema-chair.glb");
    const ref = useRef<THREE.Group>(null);

    useEffect(() => {
        if (!ref.current || !onLoad) return;
        const box = new THREE.Box3().setFromObject(ref.current);
        onLoad(box);
    }, [onLoad]);

    return <primitive ref={ref} object={scene.clone(true)} position={position} />;
};

useGLTF.preload("/models/cinema-chair.glb");

// ============================================================================
// Three.js — Chair rows
// ============================================================================

const CHAIR_COUNT = 8;
const ROW_COUNT = 5;

const ChairRows = ({ onReady }: { onReady: (box: THREE.Box3) => void }) => {
    const measured = useRef(false);
    const [positions, setPositions] = useState<[number, number, number][]>(
        Array.from({ length: CHAIR_COUNT * ROW_COUNT }, () => [0, 0, 0]),
    );

    const handleFirstLoad = useCallback(
        (singleBox: THREE.Box3) => {
            if (measured.current) return;
            measured.current = true;

            const size = new THREE.Vector3();
            singleBox.getSize(size);
            const spacingX = size.x * 1.1;
            const spacingZ = size.z * 1.5;
            const totalWidth = (CHAIR_COUNT - 1) * spacingX;
            const totalDepth = (ROW_COUNT - 1) * spacingZ;

            const newPositions: [number, number, number][] = [];
            for (let row = 0; row < ROW_COUNT; row++) {
                for (let col = 0; col < CHAIR_COUNT; col++) {
                    newPositions.push([
                        -totalWidth / 2 + col * spacingX,
                        0,
                        totalDepth / 2 - row * spacingZ,
                    ]);
                }
            }
            setPositions(newPositions);
            onReady(
                new THREE.Box3(
                    new THREE.Vector3(-totalWidth / 2 + singleBox.min.x, singleBox.min.y, -totalDepth / 2 + singleBox.min.z),
                    new THREE.Vector3(totalWidth / 2 + singleBox.max.x, singleBox.max.y, totalDepth / 2 + singleBox.max.z),
                ),
            );
        },
        [onReady],
    );

    return (
        <>
            {positions.map((pos, i) => (
                <CinemaChair key={i} position={pos} onLoad={i === 0 ? handleFirstLoad : undefined} />
            ))}
        </>
    );
};

// ============================================================================
// UI — Curtain
// Closed: covers full half (translateX 0)
// Open:   slid fully off-screen except a tiny gathered sliver
// The "3%" sliver trick is ONLY for the open state.
// When closing we go to exactly 0% — full coverage, no chair bleed-through.
// ============================================================================

const CURTAIN_OPEN_DURATION  = 3200; // ms — matches CSS transition
const CURTAIN_CLOSE_DURATION = 2200; // ms — matches CSS transition

const Curtain = ({ side, open }: { side: "left" | "right"; open: boolean }) => {
    const isLeft = side === "left";
    const PLEATS = 9;

    const translateX = open
        ? isLeft ? "calc(-100% + 24px)" : "calc(100% - 24px)"
        : "0%"; // fully closed — no gap

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                [isLeft ? "left" : "right"]: 0,
                width: "51%",
                zIndex: 50,
                transform: `translateX(${translateX})`,
                transition: open
                    ? `transform ${CURTAIN_OPEN_DURATION}ms cubic-bezier(0.16, 0, 0.1, 1)`
                    : `transform ${CURTAIN_CLOSE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                transformOrigin: isLeft ? "left center" : "right center",
                display: "flex",
                flexDirection: isLeft ? "row" : "row-reverse",
                pointerEvents: "none",
                filter: "drop-shadow(0 0 40px rgba(0,0,0,0.95))",
            }}
        >
            {Array.from({ length: PLEATS }).map((_, i) => {
                const isFold = i % 2 === 0;
                return (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            height: "100%",
                            background: `linear-gradient(${isLeft ? "to right" : "to left"
                                }, ${isFold ? "#7a0a0a" : "#3d0404"} 0%, ${isFold ? "#b01010" : "#5a0808"
                                } 40%, ${isFold ? "#7a0a0a" : "#3d0404"} 70%, #1a0000 100%)`,
                            boxShadow: isFold
                                ? isLeft ? "inset -4px 0 8px rgba(0,0,0,0.5)" : "inset 4px 0 8px rgba(0,0,0,0.5)"
                                : "none",
                        }}
                    />
                );
            })}
            {/* Leading edge shadow */}
            <div
                style={{
                    width: 28,
                    flexShrink: 0,
                    height: "100%",
                    background: isLeft
                        ? "linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.9))"
                        : "linear-gradient(to left, rgba(0,0,0,0), rgba(0,0,0,0.9))",
                }}
            />
        </div>
    );
};

// ============================================================================
// UI — Curtain rod
// ============================================================================

const CurtainRod = () => (
    <div
        style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 18,
            zIndex: 70,
            background: "linear-gradient(to bottom, #1a0a00 0%, #3d1a00 40%, #2a1000 70%, #0d0500 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.9), 0 1px 0 rgba(255,180,80,0.15)",
            pointerEvents: "none",
        }}
    >
        <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(to right, transparent, #c8922a 15%, #f0c060 50%, #c8922a 85%, transparent)",
            opacity: 0.7,
        }} />
    </div>
);

// ============================================================================
// UI — Countdown overlay
// Sits ABOVE curtains (z-index 65) so it's visible during countdown phase
// ============================================================================

const CountdownOverlay = ({ count }: { count: number }) => (
    <div style={{
        position: "absolute", inset: 0, zIndex: 65,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        pointerEvents: "none",
    }}>
        <span
            key={count}
            style={{
                fontSize: 180, fontWeight: 900, color: "white", lineHeight: 1,
                animation: "cdpop 1s ease-out forwards",
                textShadow: "0 0 80px rgba(255,60,60,0.9), 0 0 20px rgba(255,60,60,0.5)",
            }}
        >
            {count}
        </span>
        <style>{`
            @keyframes cdpop {
                0%   { transform: scale(1.8); opacity: 0; }
                15%  { transform: scale(1);   opacity: 1; }
                75%  { transform: scale(1);   opacity: 1; }
                100% { transform: scale(0.5); opacity: 0; }
            }
            @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
            @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        `}</style>
    </div>
);

// ============================================================================
// UI — Recording HUD (PiP + stop button)
// BUG FIX: videoRef from useRecorder IS the ref that gets srcObject assigned.
// We pass it directly here so it's the same DOM node the hook writes to.
// ============================================================================

interface RecordingHUDProps {
    mode: CaptureMode;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    streamRef: React.RefObject<MediaStream | null>;
    onStop: () => void;
    elapsed: number;
}

const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const RecordingHUD = ({ mode, videoRef, streamRef, onStop, elapsed }: RecordingHUDProps) => {
    useEffect(() => {
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [videoRef, streamRef]);

    return (
    <div style={{
        position: "absolute", bottom: 20, left: 20, zIndex: 65,
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10,
    }}>
        {/* PiP window */}
        <div style={{
            width: 200, height: 113, borderRadius: 12, overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.15)", background: "#111",
            position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        }}>
            {mode === "video" ? (
                // FIX: this is the SAME ref the hook assigned srcObject to —
                // not a new video element. The hook writes stream → videoRef.current,
                // so this renders it correctly.
                <video
                    ref={videoRef as React.RefObject<HTMLVideoElement>}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                <div style={{
                    width: "100%", height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 6, color: "#aaa",
                }}>
                    <span style={{ fontSize: 32 }}>🎙️</span>
                    <span style={{ fontSize: 11, fontFamily: "monospace" }}>Audio recording</span>
                </div>
            )}

            {/* REC badge */}
            <div style={{
                position: "absolute", top: 8, left: 8,
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(180,0,0,0.9)", borderRadius: 99,
                padding: "3px 8px", fontSize: 10, fontWeight: 700,
                color: "white", fontFamily: "monospace", letterSpacing: 1,
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "white",
                    animation: "blink 1s infinite",
                }} />
                REC
            </div>

            {/* Timer */}
            <div style={{
                position: "absolute", bottom: 8, right: 8,
                fontFamily: "monospace", fontSize: 11, color: "white",
                background: "rgba(0,0,0,0.65)", padding: "2px 6px", borderRadius: 4,
            }}>
                {fmt(elapsed)}
            </div>
        </div>

        {/* Stop button */}
        <button
            onClick={onStop}
            style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#b91c1c", color: "white", border: "none",
                borderRadius: 10, padding: "10px 18px",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                boxShadow: "0 4px 20px rgba(185,28,28,0.5)",
                transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#991b1b")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#b91c1c")}
        >
            <span>⏹</span> Stop Recording
        </button>
    </div>
    );
};

// ============================================================================
// UI — Mode select overlay
// ============================================================================

const MODES = [
    { value: "video" as CaptureMode, icon: "🎥", label: "Video & Audio", hint: "Camera + microphone" },
    { value: "audio" as CaptureMode, icon: "🎙️", label: "Audio Only",    hint: "Microphone only"    },
];

interface ModeSelectProps {
    mode: CaptureMode;
    setMode: (m: CaptureMode) => void;
    countdown: number;
    setCountdown: (n: number) => void;
    onStart: () => void;
}

const ModeSelect = ({ mode, setMode, countdown, setCountdown, onStart }: ModeSelectProps) => (
    <div style={{
        position: "absolute", inset: 0, zIndex: 80,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
    }}>
        <div style={{
            background: "#141414", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "36px 40px", width: 420,
            display: "flex", flexDirection: "column", gap: 28,
            boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
        }}>
            <div>
                <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: 0 }}>
                    Ready to present?
                </h2>
                <p style={{ color: "#888", fontSize: 14, margin: "6px 0 0" }}>
                    Choose your recording mode and start when ready.
                </p>
            </div>

            {/* Mode buttons */}
            <div style={{ display: "flex", gap: 12 }}>
                {MODES.map((m) => (
                    <button key={m.value} onClick={() => setMode(m.value)} style={{
                        flex: 1, display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 6, padding: "16px 12px",
                        borderRadius: 14,
                        border: `2px solid ${mode === m.value ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                        background: mode === m.value ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.03)",
                        color: mode === m.value ? "#ef4444" : "#888",
                        cursor: "pointer", transition: "all 0.2s",
                    }}>
                        <span style={{ fontSize: 28 }}>{m.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</span>
                        <span style={{ fontSize: 11, opacity: 0.7 }}>{m.hint}</span>
                    </button>
                ))}
            </div>

            {/* Countdown picker */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ color: "#aaa", fontSize: 13, fontWeight: 500 }}>
                    Countdown before recording
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                    {[0, 3, 5, 10].map((n) => (
                        <button key={n} onClick={() => setCountdown(n)} style={{
                            flex: 1, padding: "8px 0", borderRadius: 10,
                            border: `2px solid ${countdown === n ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                            background: countdown === n ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.03)",
                            color: countdown === n ? "#ef4444" : "#888",
                            fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
                        }}>
                            {n === 0 ? "Off" : `${n}s`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Start */}
            <button onClick={onStart} style={{
                background: "#b91c1c", color: "white", border: "none",
                borderRadius: 12, padding: "14px",
                fontWeight: 700, fontSize: 15, cursor: "pointer",
                boxShadow: "0 4px 24px rgba(185,28,28,0.4)",
                transition: "background 0.2s", letterSpacing: 0.3,
            }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#991b1b")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#b91c1c")}
            >
                ⏺ Start Presentation
            </button>
        </div>
    </div>
);

// ============================================================================
// UI — Preview overlay
// FIX: only shown when previewUrl is truthy AND phase === "preview"
// so it never appears during "closing" phase even if blob lands early.
// ============================================================================

interface PreviewOverlayProps {
    mode: CaptureMode;
    previewUrl: string;
    onReset: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

const PreviewOverlay = ({ mode, previewUrl, onReset, onSubmit, isSubmitting }: PreviewOverlayProps) => (
    <div style={{
        position: "absolute", inset: 0, zIndex: 80,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
    }}>
        <div style={{ width: "60%", maxWidth: 560 }}>
            {mode === "video" ? (
                <video src={previewUrl} controls style={{
                    width: "100%", borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)", background: "#000",
                }} />
            ) : (
                <div style={{
                    background: "#141414", borderRadius: 16, padding: "32px 24px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                }}>
                    <span style={{ fontSize: 48 }}>🎙️</span>
                    <p style={{ color: "#aaa", margin: 0, fontSize: 14 }}>Preview your recording</p>
                    <audio src={previewUrl} controls style={{ width: "100%" }} />
                </div>
            )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onReset} style={{
                padding: "12px 24px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)", color: "white",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>
                🔄 Re-record
            </button>
            <button onClick={onSubmit} disabled={isSubmitting} style={{
                padding: "12px 24px", borderRadius: 12, border: "none",
                background: isSubmitting ? "#555" : "#b91c1c", color: "white",
                fontWeight: 700, fontSize: 14,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(185,28,28,0.4)",
                transition: "background 0.2s",
            }}>
                {isSubmitting ? "Analyzing…" : "✨ Analyze Recording"}
            </button>
        </div>
    </div>
);

// ============================================================================
// Three.js fallback
// ============================================================================

const Loader = () => (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#555" wireframe />
    </mesh>
);

// ============================================================================
// Page
// ============================================================================

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
        mode, setMode,
        previewUrl, recordedBlob,
        videoRef,             // ← the ref the hook assigns srcObject to
        streamRef,
        startRecording, stopRecording, reset, error,
    } = useRecorder();

    const handleSceneReady = useCallback((box: THREE.Box3) => setRowBox(box), []);

    // ── Start: acquire stream first, then countdown (or go straight to recording)
    const handleStart = useCallback(async () => {
        await startRecording(); // acquires stream & starts MediaRecorder

        if (countdownDuration === 0) {
            setCurtainsOpen(true);
            setPhase("recording");
            elapsedTimerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
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
            elapsedTimerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
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
            const file = new File([recordedBlob], filename, { type: recordedBlob.type });

            setCurrentFile({ file, name: filename, type: recordedBlob.type });

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", { method: "POST", body: formData });

            if (!response.ok) {
                const { error: serverError } = (await response.json()) as { error: string };
                throw new Error(serverError ?? `Server error: ${response.status}`);
            }

            const result = (await response.json()) as AnalysisResultType;
            setAnalysisResult(result);
            router.push("/analysis/123");
        } catch (err: unknown) {
            console.error("[RecordPage] submit error:", err);
            toast.error(err instanceof Error ? `Analysis failed: ${err.message}` : "Unknown error.");
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    }, [recordedBlob, setCurrentFile, setAnalysisResult, router]);

    // ── Cleanup
    useEffect(() => () => {
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }, []);

    return (
        <div style={{
            width: "100%", height: "100vh", background: "#0a0a0a",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 12, overflow: "hidden",
        }}>
            <p style={{
                color: "#555", fontSize: 11, letterSpacing: 3,
                fontFamily: "monospace", textTransform: "uppercase", margin: 0,
            }}>
                SpeakConfident AI — Presentation Stage
            </p>

            {/* ── Main stage ── */}
            <div style={{
                width: "100%", maxWidth: 1200, height: "80vh",
                position: "relative", borderRadius: 20, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}>
                {/* Rod always on top */}
                <CurtainRod />

                {/* Curtains */}
                <Curtain side="left"  open={curtainsOpen} />
                <Curtain side="right" open={curtainsOpen} />

                {/* Mode select — above curtains */}
                {phase === "mode-select" && (
                    <ModeSelect
                        mode={mode} setMode={setMode}
                        countdown={countdownDuration} setCountdown={setCountdownDuration}
                        onStart={handleStart}
                    />
                )}

                {/* Countdown — ABOVE curtains so it's visible */}
                {phase === "countdown" && <CountdownOverlay count={countdownTick} />}

                {/* Recording HUD — above the open curtain slivers */}
                {phase === "recording" && (
                    <RecordingHUD
                        mode={mode}
                        videoRef={videoRef}   // same ref the hook wrote srcObject to
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
                    <div style={{
                        position: "absolute", bottom: 20, left: "50%",
                        transform: "translateX(-50%)", zIndex: 90,
                        background: "#7f1d1d", color: "white",
                        padding: "10px 20px", borderRadius: 10, fontSize: 13,
                    }}>
                        {error}
                    </div>
                )}

                {/* Three.js canvas — behind everything */}
                <Canvas
                    camera={{ position: [0, 5, 20], fov: 50 }}
                    shadows
                    gl={{ antialias: true, outputColorSpace: THREE.SRGBColorSpace }}
                >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
                    <pointLight position={[-6, 5, -4]} intensity={0.8} color="#a78bfa" />
                    <pointLight position={[6, 5, -4]}  intensity={0.8} color="#60a5fa" />

                    <Suspense fallback={<Loader />}>
                        <ChairRows onReady={handleSceneReady} />
                        {rowBox && <CameraRig box={rowBox} />}
                        <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={30} blur={2} />
                        <Environment preset="lobby" />
                    </Suspense>

                    <OrbitControls makeDefault enablePan={false} minDistance={1} maxDistance={500} maxPolarAngle={Math.PI / 2.1} />
                </Canvas>
            </div>

            <p style={{ color: "#333", fontSize: 11, fontFamily: "monospace", margin: 0 }}>
                drag to orbit · scroll to zoom
            </p>
        </div>
    );
};

export default RecordPresentationPage;