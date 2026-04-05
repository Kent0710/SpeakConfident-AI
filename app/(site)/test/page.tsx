"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
    useGLTF,
    OrbitControls,
    Environment,
    ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Camera rig — fits camera to bounding box
// ---------------------------------------------------------------------------

const CameraRig = ({ box }: { box: THREE.Box3 }) => {
    const { camera, controls } = useThree();

    useEffect(() => {
        if (box.isEmpty()) return;

        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        const perspectiveCamera = camera as THREE.PerspectiveCamera;
        const fov = perspectiveCamera.fov * (Math.PI / 180);
        const fitHeightDistance = size.y / (2 * Math.tan(fov / 2));
        const fitWidthDistance =
            size.x / (2 * Math.tan(fov / 2) * perspectiveCamera.aspect);
        const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.5;

        camera.position.set(
            center.x,
            center.y + size.y * 0.5 + 30,
            center.z + distance,
        );

        if (controls) {
            // @ts-expect-error - OrbitControls type is missing .target.copy()
            controls.target.copy(center);
            // @ts-expect-error - OrbitControls type is missing .update()
            controls.update();
        } else {
            camera.lookAt(center);
        }
        camera.updateProjectionMatrix();
    }, [box, camera, controls]);

    return null;
};

// ---------------------------------------------------------------------------
// Single chair
// ---------------------------------------------------------------------------

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

    const cloned = scene.clone(true);
    return <primitive ref={ref} object={cloned} position={position} />;
};

useGLTF.preload("/models/cinema-chair.glb");

// ---------------------------------------------------------------------------
// Chair rows
// ---------------------------------------------------------------------------

const CHAIR_COUNT = 5;
const ROW_COUNT = 3;

const ChairRows = ({ onReady }: { onReady: (box: THREE.Box3) => void }) => {
    const measured = useRef(false);
    const [positions, setPositions] = useState<[number, number, number][]>(
        Array.from({ length: CHAIR_COUNT * ROW_COUNT }, () => [0, 0, 0]),
    );

    const handleFirstLoad = (singleBox: THREE.Box3) => {
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

        const rowBox = new THREE.Box3(
            new THREE.Vector3(
                -totalWidth / 2 + singleBox.min.x,
                singleBox.min.y,
                -totalDepth / 2 + singleBox.min.z,
            ),
            new THREE.Vector3(
                totalWidth / 2 + singleBox.max.x,
                singleBox.max.y,
                totalDepth / 2 + singleBox.max.z,
            ),
        );
        onReady(rowBox);
    };

    return (
        <>
            {positions.map((pos, i) => (
                <CinemaChair
                    key={i}
                    position={pos}
                    onLoad={i === 0 ? handleFirstLoad : undefined}
                />
            ))}
        </>
    );
};

// ---------------------------------------------------------------------------
// Loader fallback
// ---------------------------------------------------------------------------

const Loader = () => (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#555" wireframe />
    </mesh>
);

// ---------------------------------------------------------------------------
// Curtain — GPU-composited transform animation, fabric fold effect
// ---------------------------------------------------------------------------

interface CurtainProps {
    side: "left" | "right";
    open: boolean;
}

const Curtain = ({ side, open }: CurtainProps) => {
    const isLeft = side === "left";

    // Each "pleat" is a vertical strip. When closed, they're bunched together.
    // We translate the whole curtain panel off-screen when opened.
    // Using transform: translateX avoids layout reflow → smooth 60fps.
    const translateX = open
        ? isLeft
            ? "calc(-100% + 3%)"
            : "calc(100% - 3%)"
        : "0%";

    // Number of fabric fold strips for the gathered look
    const PLEATS = 9;

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                [isLeft ? "left" : "right"]: 0,
                width: "50%",
                zIndex: 50,
                transform: `translateX(${translateX})`,
                // Custom spring-like cubic-bezier:
                // starts very slow (inertia), accelerates, then gently eases out
                transition: open
                    ? "transform 3.2s cubic-bezier(0.16, 0, 0.1, 1)"
                    : "transform 2s cubic-bezier(0.4, 0, 1, 1)",
                transformOrigin: isLeft ? "left center" : "right center",
                display: "flex",
                flexDirection: isLeft ? "row" : "row-reverse",
                pointerEvents: "none",
                filter: "drop-shadow(0 0 40px rgba(0,0,0,0.9))",
            }}
        >
            {/* Fabric pleats */}
            {Array.from({ length: PLEATS }).map((_, i) => {
                // Alternate light/dark to simulate folds catching light
                const isFold = i % 2 === 0;
                const baseRed = isFold ? "#7a0a0a" : "#3d0404";
                const highlight = isFold ? "#b01010" : "#5a0808";

                return (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            height: "100%",
                            background: `linear-gradient(${
                                isLeft ? "to right" : "to left"
                            }, ${baseRed} 0%, ${highlight} 40%, ${baseRed} 70%, #1a0000 100%)`,
                            // Subtle cloth wave using skew — each pleat slightly different
                            boxShadow: isFold
                                ? isLeft
                                    ? "inset -4px 0 8px rgba(0,0,0,0.5)"
                                    : "inset 4px 0 8px rgba(0,0,0,0.5)"
                                : "none",
                        }}
                    />
                );
            })}

            {/* Leading edge shadow — the part facing the screen center */}
            <div
                style={{
                    width: 28,
                    flexShrink: 0,
                    height: "100%",
                    background: isLeft
                        ? "linear-gradient(to right, rgba(0,0,0,0.0), rgba(0,0,0,0.85))"
                        : "linear-gradient(to left, rgba(0,0,0,0.0), rgba(0,0,0,0.85))",
                }}
            />
        </div>
    );
};

// ---------------------------------------------------------------------------
// Curtain rod / pelmet across the top
// ---------------------------------------------------------------------------

const CurtainRod = () => (
    <div
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 18,
            zIndex: 60,
            background:
                "linear-gradient(to bottom, #1a0a00 0%, #3d1a00 40%, #2a1000 70%, #0d0500 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.9), 0 1px 0 rgba(255,180,80,0.15)",
            pointerEvents: "none",
        }}
    >
        {/* Gold trim line */}
        <div
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                background:
                    "linear-gradient(to right, transparent, #c8922a 15%, #f0c060 50%, #c8922a 85%, transparent)",
                opacity: 0.7,
            }}
        />
    </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TestPage = () => {
    const [rowBox, setRowBox] = useState<THREE.Box3 | null>(null);
    const [openCurtains, setOpenCurtains] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setOpenCurtains(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const handleReady = (box: THREE.Box3) => {
        setRowBox(box);
    };

    return (
        <div className="w-full h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            <p className="text-neutral-400 text-sm tracking-widest uppercase font-mono z-10">
                test / cinema-chair.glb — 5 seats
            </p>

            <div className="w-full  h-full rounded-2xl overflow-hidden border border-neutral-800 relative shadow-2xl">
                {/* Curtain rod on top */}
                <CurtainRod />

                {/* Left curtain */}
                <Curtain side="left" open={openCurtains} />

                {/* Right curtain */}
                <Curtain side="right" open={openCurtains} />

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
                    <pointLight position={[-6, 5, -4]} intensity={0.8} color="#a78bfa" />
                    <pointLight position={[6, 5, -4]} intensity={0.8} color="#60a5fa" />

                    <Suspense fallback={<Loader />}>
                        <ChairRows onReady={handleReady} />
                        {rowBox && <CameraRig box={rowBox} />}
                        <ContactShadows
                            position={[0, -0.01, 0]}
                            opacity={0.5}
                            scale={30}
                            blur={2}
                        />
                        <Environment preset="lobby" />
                    </Suspense>

                    <OrbitControls
                        makeDefault
                        enablePan={false}
                        minDistance={1}
                        maxDistance={500}
                        maxPolarAngle={Math.PI / 2.1}
                    />
                </Canvas>
            </div>

            <p className="text-neutral-600 text-xs font-mono">
                drag to orbit · scroll to zoom
            </p>
        </div>
    );
};

export default TestPage;