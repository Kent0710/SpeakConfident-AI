'use client'

import { useEffect, useRef, useState, useCallback } from "react";
import { CaptureMode } from "@/hooks/use-recorder";
import { Move } from "lucide-react";

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
    const [pos, setPos] = useState({ x: 20, y: 20 });
    const [size, setSize] = useState({ width: 250, height: 140 }); // ~16:9
    const [interaction, setInteraction] = useState<"drag" | "resize" | null>(null);
    
    // Using refs to hold latest values for pointer events without re-rendering handlers
    const dragState = useRef({
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0,
        initialWidth: 0,
        initialHeight: 0,
        resizeHandle: ""
    });

    useEffect(() => {
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.muted = true;
        }
    }, [videoRef, streamRef, interaction]); // re-run if interaction changes (un-hiding)

    const stopInteraction = useCallback(() => {
        setInteraction(null);
        document.body.style.cursor = "default";
    }, []);

    const onPointerMove = useCallback((e: PointerEvent) => {
        if (!interaction) return;

        const { startX, startY, initialX, initialY, initialWidth, initialHeight, resizeHandle } = dragState.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (interaction === "drag") {
            setPos({
                x: initialX + dx,
                y: initialY - dy // y acts as "bottom" so dragging down (positive dy) decreases y
            });
        } else if (interaction === "resize") {
            let newW = initialWidth;
            let newH = initialHeight;
            let newX = initialX;
            let newY = initialY;

            // Horizontal resizing
            if (resizeHandle.includes("e")) newW = initialWidth + dx;
            if (resizeHandle.includes("w")) {
                newW = initialWidth - dx;
                newX = initialX + dx;
            }

            // Vertical resizing (remember dy is down, y is bottom)
            if (resizeHandle.includes("n")) newH = initialHeight - dy; // dragging up (negative dy) increases height
            if (resizeHandle.includes("s")) {
                newH = initialHeight + dy; // dragging down (positive dy) increases height
                newY = initialY - dy;
            }

            // Constraints (min 150x84, max 50vw/50vh approx)
            const maxW = window.innerWidth * 0.5;
            const maxH = window.innerHeight * 0.5;
            
            if (newW < 150) { newX += (newW - 150); newW = 150; }
            if (newW > maxW) { newX += (newW - maxW); newW = maxW; }
            if (newH < 84) { newY += (newH - 84); newH = 84; }
            if (newH > maxH) { newY += (newH - maxH); newH = maxH; }

            setSize({ width: newW, height: newH });
            setPos({ x: newX, y: newY });
        }
    }, [interaction]);

    const onPointerUp = useCallback((e: PointerEvent) => {
        stopInteraction();
    }, [stopInteraction]);

    // Attach window-level specific events for smooth dragging outside the boundary
    useEffect(() => {
        if (interaction) {
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
        } else {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        }
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [interaction, onPointerMove, onPointerUp]);

    const startDrag = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragState.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: pos.x,
            initialY: pos.y,
            initialWidth: size.width,
            initialHeight: size.height,
            resizeHandle: ""
        };
        setInteraction("drag");
    };

    const startResize = (e: React.PointerEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        dragState.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: pos.x,
            initialY: pos.y,
            initialWidth: size.width,
            initialHeight: size.height,
            resizeHandle: handle
        };
        setInteraction("resize");
    };

    // Styling helpers for resize handlers
    const handleStyle = (cursor: string): React.CSSProperties => ({
        position: "absolute", zIndex: 10, cursor
    });

    return (
    <div style={{
        position: "absolute", 
        bottom: pos.y, 
        left: pos.x, 
        zIndex: 100, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "flex-start", 
        gap: 10,
        touchAction: "none"
    }}>
        {/* PiP window */}
        <div style={{
            width: size.width, 
            height: size.height, 
            borderRadius: 12, overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.15)", background: "#111",
            position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        }}>
            
            {/* Drag Handle Indicator */}
            <div 
                onPointerDown={startDrag}
                style={{
                    position: "absolute",
                    top: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 20, // Above video, below outer edges
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 20,
                    padding: "4px 12px",
                    cursor: "move",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Move size={14} color="white" opacity={0.8} />
            </div>

            {/* Resize Handles */}
            <div onPointerDown={(e) => startResize(e, "n")} style={{ ...handleStyle("ns-resize"), top: 0, left: 0, right: 0, height: 8 }} />
            <div onPointerDown={(e) => startResize(e, "s")} style={{ ...handleStyle("ns-resize"), bottom: 0, left: 0, right: 0, height: 8 }} />
            <div onPointerDown={(e) => startResize(e, "w")} style={{ ...handleStyle("ew-resize"), top: 0, left: 0, bottom: 0, width: 8 }} />
            <div onPointerDown={(e) => startResize(e, "e")} style={{ ...handleStyle("ew-resize"), top: 0, right: 0, bottom: 0, width: 8 }} />
            <div onPointerDown={(e) => startResize(e, "nw")} style={{ ...handleStyle("nwse-resize"), top: 0, left: 0, width: 12, height: 12 }} />
            <div onPointerDown={(e) => startResize(e, "ne")} style={{ ...handleStyle("nesw-resize"), top: 0, right: 0, width: 12, height: 12 }} />
            <div onPointerDown={(e) => startResize(e, "sw")} style={{ ...handleStyle("nesw-resize"), bottom: 0, left: 0, width: 12, height: 12 }} />
            <div onPointerDown={(e) => startResize(e, "se")} style={{ ...handleStyle("nwse-resize"), bottom: 0, right: 0, width: 12, height: 12 }} />

            {interaction && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 15,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(20,20,20,0.95)"
                }}>
                    <span style={{ color: "#aaa", fontSize: 13, fontWeight: 500 }}>
                        {interaction === "drag" ? "Moving..." : "Resizing..."}
                    </span>
                </div>
            )}

            {mode === "video" ? (
                <video
                    ref={videoRef as React.RefObject<HTMLVideoElement>}
                    autoPlay
                    muted
                    playsInline
                    style={{ 
                        width: "100%", height: "100%", objectFit: "cover",
                        opacity: interaction ? 0 : 1 // Hide video feed to prevent UI lag during drag/resize
                    }}
                />
            ) : (
                <div style={{
                    width: "100%", height: "100%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 6, color: "#aaa",
                    opacity: interaction ? 0 : 1
                }}>
                    <span style={{ fontSize: 32 }}>🎙️</span>
                    <span style={{ fontSize: 11, fontFamily: "monospace" }}>Audio recording</span>
                </div>
            )}

            {/* REC badge */}
            <div style={{
                position: "absolute", top: 8, left: 8, zIndex: 10,
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(180,0,0,0.9)", borderRadius: 99,
                padding: "3px 8px", fontSize: 10, fontWeight: 700,
                color: "white", fontFamily: "monospace", letterSpacing: 1,
                opacity: interaction ? 0 : 1
            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "white",
                    animation: "blink 1s infinite",
                }} />
                REC
            </div>

            {/* Timer */}
            <div style={{
                position: "absolute", bottom: 8, right: 8, zIndex: 10,
                fontFamily: "monospace", fontSize: 11, color: "white",
                background: "rgba(0,0,0,0.65)", padding: "2px 6px", borderRadius: 4,
                opacity: interaction ? 0 : 1
            }}>
                {fmt(elapsed)}
            </div>
        </div>

        {/* Stop button */}
        <button
            onClick={onStop}
            onPointerDown={(e) => e.stopPropagation()} // Prevent any accidental drag events
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