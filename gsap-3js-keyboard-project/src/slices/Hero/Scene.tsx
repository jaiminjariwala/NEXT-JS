// we are not inside a DOM anymore, we are now inside REACT THREE FIBER

"use client";
import { Keyboard } from "@/components/Keyboard";
import { Keycap } from "@/components/Keycap";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { useControls } from "leva";
// Leva is a GUI library specifically designed for React Three Fiber that creates an interactive control panel for tweaking 3D scene parameters in real-time during development.

// import Keyboard from "@/components/Keyboard";
export function Scene() {
  const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ } =
    useControls({
      positionX: 0.34,
      positionY: -0.42,
      positionZ: 2.23,
      rotationX: Math.PI / 2,
      rotationY: 0.38,
      rotationZ: -0.06,
    });
  return (
    // <group></group> is a react3fiber abstraction for an actual object being created
    <group>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
      <Keyboard
        scale={8}
        position={[positionX, positionY, positionZ]}
        rotation={[rotationX, rotationY, rotationZ]}
      />

      <group>
        <Keycap position={[0, -0.4, 2.6]} rotation={[0, 2, 3]} texture={0}/>
        <Keycap position={[-1.4, 0, 2.3]} rotation={[3, 2, 1]} texture={1}/>
        <Keycap position={[-1.8, 1, 1.5]} rotation={[0, 1, 3]} texture={2}/>
        <Keycap position={[0, 1, 1]} rotation={[0, 4, 2]} texture={3}/>
        <Keycap position={[0.7, 0.9, 1.4]} rotation={[3, 2, 0]} texture={4}/>
        <Keycap position={[1.3, -0.3, 2.3]} rotation={[1, 2, 0]} texture={5}/>
        <Keycap position={[0, 1, 2]} rotation={[2, 2, 3]} texture={6}/>
        <Keycap position={[-0.7, 0.6, 2]} rotation={[1, 4, 0]} texture={7}/>
        <Keycap position={[-0.77, 0.1, 2.8]} rotation={[3, 2, 3]} texture={8}/>
        <Keycap position={[2, 0, 1]} rotation={[0, 0, 3]} texture={7}/>
      </group>

      <Environment
        files={["/hdr/blue-studio.hdr"]}
        environmentIntensity={0.2}
      />

      <spotLight
        position={[-2, 1.5, 3]}
        intensity={30}
        castShadow
        shadow-bias={-0.0002}
        shadow-normalBias={0.002}
        shadow-mapSize={1024}
      />
    </group>
  );
}
