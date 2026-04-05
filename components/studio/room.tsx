"use client";

import React from "react";
import * as THREE from "three";

const Room = () => {
    return (
        <group>
            <mesh position={[0, 30, 0]} receiveShadow>
                <boxGeometry args={[1020, 1000, 1000]} />
                <meshStandardMaterial
                    color="#111111"
                    side={THREE.BackSide}
                    roughness={0.95}   // ← matte walls catch light better
                    metalness={0.0}
                />
            </mesh>

            {/* Floor plane — separate mesh so it can receiveShadow cleanly */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[160, 160]} />
                <meshStandardMaterial
                    color="#080808"
                    roughness={0.9}
                    metalness={0.0}
                />
            </mesh>

            {/* Trims */}
            <mesh position={[0, 0.1, -79.9]}>
                <planeGeometry args={[160, 0.5]} />
                <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[-79.9, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[160, 0.5]} />
                <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[79.9, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[160, 0.5]} />
                <meshBasicMaterial color="#ef4444" />
            </mesh>
        </group>
    );
};

export default Room;