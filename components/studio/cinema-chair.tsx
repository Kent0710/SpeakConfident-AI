"use client";

import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

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

    return (
        <primitive ref={ref} object={scene.clone(true)} position={position} />
    );
};

useGLTF.preload("/models/cinema-chair.glb");

export default CinemaChair;