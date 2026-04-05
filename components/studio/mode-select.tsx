"use client";

import { CaptureMode } from "@/hooks/use-recorder";
import Link from "next/link";
import { Button } from "../ui/button";

const MODES = [
    {
        value: "video" as CaptureMode,
        icon: "🎥",
        label: "Video & Audio",
        hint: "Camera + microphone",
    },
    {
        value: "audio" as CaptureMode,
        icon: "🎙️",
        label: "Audio Only",
        hint: "Microphone only",
    },
];

interface ModeSelectProps {
    mode: CaptureMode;
    setMode: (m: CaptureMode) => void;
    countdown: number;
    setCountdown: (n: number) => void;
    onStart: () => void;
}

const ModeSelect = ({
    mode,
    setMode,
    countdown,
    setCountdown,
    onStart,
}: ModeSelectProps) => (
    <div
        style={{
            position: "absolute",
            inset: 0,
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(6px)",
        }}
    >
        <div
            style={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "36px 40px",
                width: 420,
                display: "flex",
                flexDirection: "column",
                gap: 28,
                boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
            }}
        >
            <div>
                <h2
                    style={{
                        color: "white",
                        fontSize: 22,
                        fontWeight: 700,
                        margin: 0,
                    }}
                >
                    Ready to present?
                </h2>
                <p style={{ color: "#888", fontSize: 14, margin: "6px 0 0" }}>
                    Choose your recording mode and start when ready.
                </p>
            </div>

            {/* Mode buttons */}
            <div style={{ display: "flex", gap: 12 }}>
                {MODES.map((m) => (
                    <button
                        key={m.value}
                        onClick={() => setMode(m.value)}
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            padding: "16px 12px",
                            borderRadius: 14,
                            border: `2px solid ${mode === m.value ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                            background:
                                mode === m.value
                                    ? "rgba(239,68,68,0.1)"
                                    : "rgba(255,255,255,0.03)",
                            color: mode === m.value ? "#ef4444" : "#888",
                            cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                    >
                        <span style={{ fontSize: 28 }}>{m.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                            {m.label}
                        </span>
                        <span style={{ fontSize: 11, opacity: 0.7 }}>
                            {m.hint}
                        </span>
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
                        <button
                            key={n}
                            onClick={() => setCountdown(n)}
                            style={{
                                flex: 1,
                                padding: "8px 0",
                                borderRadius: 10,
                                border: `2px solid ${countdown === n ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                                background:
                                    countdown === n
                                        ? "rgba(239,68,68,0.1)"
                                        : "rgba(255,255,255,0.03)",
                                color: countdown === n ? "#ef4444" : "#888",
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            {n === 0 ? "Off" : `${n}s`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Start */}
            <button
                onClick={onStart}
                style={{
                    background: "#b91c1c",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 4px 24px rgba(185,28,28,0.4)",
                    transition: "background 0.2s",
                    letterSpacing: 0.3,
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#991b1b")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#b91c1c")
                }
            >
                ⏺ Start Presentation
            </button>
            <Link
                href={`/home`}
                className="text-white w-full flex justify-center"
            >
                <Button variant={"ghost"} className="w-fit">
                    Go back to Home
                </Button>
            </Link>
        </div>
    </div>
);

export default ModeSelect;
