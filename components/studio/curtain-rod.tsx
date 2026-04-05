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

export default CurtainRod;