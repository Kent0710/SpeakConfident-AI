import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

const CameraRig = ({ box }: { box: THREE.Box3 }) => {
    const { camera, controls } = useThree();

    useEffect(() => {
        if (box.isEmpty()) return;
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        const cam = camera as THREE.PerspectiveCamera;
        const fov = cam.fov * (Math.PI / 180);
        const fitH = size.y / (2 * Math.tan(fov / 2));
        const fitW = size.x / (2 * Math.tan(fov / 2) * cam.aspect);
        const distance = Math.max(fitH, fitW) * 1.5;

        camera.position.set(center.x, center.y + size.y * 0.5 + 30, center.z + distance);

        if (controls) {
            // @ts-expect-error – OrbitControls types
            controls.target.copy(center);
            // @ts-expect-error – OrbitControls types
            controls.update();
        } else {
            camera.lookAt(center);
        }
        camera.updateProjectionMatrix();
    }, [box, camera, controls]);

    return null;
};

export default CameraRig;