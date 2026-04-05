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

export default CountdownOverlay;