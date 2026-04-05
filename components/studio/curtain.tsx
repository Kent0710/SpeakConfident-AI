const CURTAIN_OPEN_DURATION = 3200; // ms — matches CSS transition
const CURTAIN_CLOSE_DURATION = 2200; // ms — matches CSS transition

const Curtain = ({ side, open }: { side: "left" | "right"; open: boolean }) => {
    const isLeft = side === "left";
    const PLEATS = 9;

    const translateX = open
        ? isLeft
            ? "calc(-100% + 24px)"
            : "calc(100% - 24px)"
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
                            background: `linear-gradient(${
                                isLeft ? "to right" : "to left"
                            }, ${isFold ? "#7a0a0a" : "#3d0404"} 0%, ${
                                isFold ? "#b01010" : "#5a0808"
                            } 40%, ${isFold ? "#7a0a0a" : "#3d0404"} 70%, #1a0000 100%)`,
                            boxShadow: isFold
                                ? isLeft
                                    ? "inset -4px 0 8px rgba(0,0,0,0.5)"
                                    : "inset 4px 0 8px rgba(0,0,0,0.5)"
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

export default Curtain;