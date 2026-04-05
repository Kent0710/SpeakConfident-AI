import { CaptureMode } from "@/hooks/use-recorder";

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

export default PreviewOverlay;