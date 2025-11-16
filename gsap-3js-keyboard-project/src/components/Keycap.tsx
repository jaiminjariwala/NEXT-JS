import * as THREE from "three";
import { Float, useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type KeycapProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
};
type GLTFResult = GLTF & {
  nodes: {
    Keycap: THREE.Mesh;
  };
  materials: Record<string, unknown>;
};

export function Keycap({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: KeycapProps) {
  const { nodes } = useGLTF("/keycap.gltf") as unknown as GLTFResult;

  const placeholderMat = new THREE.MeshStandardMaterial({
    color: "#cccccc",
    roughness: 0.2,
  });

  return (
    <Float>
      <group dispose={null} position={position} rotation={rotation}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Keycap.geometry}
          material={placeholderMat}
          rotation={[Math.PI / 2, 0, 0]}
          scale={10}
        />
      </group>
    </Float>
  );
}
