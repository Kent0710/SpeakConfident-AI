"use client";

import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import CinemaChair from "./cinema-chair";

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
                ),
            );
        },
        [onReady],
    );

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

export default ChairRows;