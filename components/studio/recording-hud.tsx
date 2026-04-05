'use client'

import { useEffect } from "react";
import { CaptureMode } from "@/hooks/use-recorder";

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

export default RecordingHUD;