import * as THREE from "three";
import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Plate: THREE.Mesh;
    Knob: THREE.Mesh;
    PCB: THREE.Mesh;
    ["625u_Wire001"]: THREE.Mesh;
    Cube005: THREE.Mesh;
    Cube005_1: THREE.Mesh;
    Top_Case: THREE.Mesh;
    Weight: THREE.Mesh;
    Screen: THREE.Mesh;
    K_LCONTROL: THREE.Mesh;
    K_GRAVE: THREE.Mesh;
    K_A: THREE.Mesh;
    K_Q: THREE.Mesh;
    K_ESC: THREE.Mesh;
    K_SPACE: THREE.Mesh;
    K_Z: THREE.Mesh;
    K_ARROWLEFT: THREE.Mesh;
    K_TAB: THREE.Mesh;
    K_ENTER: THREE.Mesh;
    K_BACKSPACE: THREE.Mesh;
    K_CAPS: THREE.Mesh;
    K_LSHIFT: THREE.Mesh;
    K_RSHIFT: THREE.Mesh;
    K_ARROWDOWN: THREE.Mesh;
    K_ARROWRIGHT: THREE.Mesh;
    K_LALT: THREE.Mesh;
    K_LWIN: THREE.Mesh;
    K_RALT: THREE.Mesh;
    K_FN: THREE.Mesh;
    K_1: THREE.Mesh;
    K_2: THREE.Mesh;
    K_3: THREE.Mesh;
    K_4: THREE.Mesh;
    K_5: THREE.Mesh;
    K_6: THREE.Mesh;
    K_7: THREE.Mesh;
    K_8: THREE.Mesh;
    K_9: THREE.Mesh;
    K_0: THREE.Mesh;
    K_DASH: THREE.Mesh;
    K_EQUAL: THREE.Mesh;
    K_DEL: THREE.Mesh;
    K_S: THREE.Mesh;
    K_D: THREE.Mesh;
    K_F: THREE.Mesh;
    K_G: THREE.Mesh;
    K_H: THREE.Mesh;
    K_J: THREE.Mesh;
    K_K: THREE.Mesh;
    K_L: THREE.Mesh;
    K_SEMICOLON: THREE.Mesh;
    K_QUOTE: THREE.Mesh;
    K_PAGEDOWN: THREE.Mesh;
    K_W: THREE.Mesh;
    K_E: THREE.Mesh;
    K_R: THREE.Mesh;
    K_T: THREE.Mesh;
    K_Y: THREE.Mesh;
    K_U: THREE.Mesh;
    K_I: THREE.Mesh;
    K_O: THREE.Mesh;
    K_P: THREE.Mesh;
    K_LSQUAREBRACKET: THREE.Mesh;
    K_RSQUAREBRACKET: THREE.Mesh;
    K_PAGEUP: THREE.Mesh;
    K_F1: THREE.Mesh;
    K_F2: THREE.Mesh;
    K_F3: THREE.Mesh;
    K_F4: THREE.Mesh;
    K_F5: THREE.Mesh;
    K_F6: THREE.Mesh;
    K_F7: THREE.Mesh;
    K_F8: THREE.Mesh;
    K_F9: THREE.Mesh;
    K_F10: THREE.Mesh;
    K_F11: THREE.Mesh;
    K_F12: THREE.Mesh;
    K_X: THREE.Mesh;
    K_C: THREE.Mesh;
    K_V: THREE.Mesh;
    K_B: THREE.Mesh;
    K_N: THREE.Mesh;
    K_M: THREE.Mesh;
    K_COMMA: THREE.Mesh;
    K_PERIOD: THREE.Mesh;
    K_SLASH: THREE.Mesh;
    K_ARROWUP: THREE.Mesh;
    K_END: THREE.Mesh;
    K_BACKSLASH: THREE.Mesh;
    Switch_Heavy002: THREE.InstancedMesh;
    Switch_Heavy002_1: THREE.InstancedMesh;
    Switch_Heavy002_2: THREE.InstancedMesh;
    Switch_Heavy002_3: THREE.InstancedMesh;
    ["2U_Wires"]: THREE.InstancedMesh;
    Stab_Housing_Instances: THREE.InstancedMesh;
  };
  materials: {
    PC: THREE.MeshStandardMaterial;
    Knob: THREE.MeshStandardMaterial;
    PCB_Black: THREE.MeshStandardMaterial;
    Gold: THREE.MeshStandardMaterial;
    Bottom_Case: THREE.MeshStandardMaterial;
    Feet: THREE.MeshStandardMaterial;
    Top_Case: THREE.MeshStandardMaterial;
    Weight: THREE.MeshStandardMaterial;
    Screen: THREE.MeshPhysicalMaterial;
    Keycaps: THREE.MeshPhysicalMaterial;
    Switch_Bottom_Housing: THREE.MeshStandardMaterial;
    Stem: THREE.MeshStandardMaterial;
    Switch_Top_Housing: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

export interface KeyboardRefs {
  // Main keyboard structure
  plate: React.RefObject<THREE.Mesh | null>;
  topCase: React.RefObject<THREE.Mesh | null>;
  weight: React.RefObject<THREE.Mesh | null>;
  screen: React.RefObject<THREE.Mesh | null>;
  knob: React.RefObject<THREE.Mesh | null>;

  // Switch groups for wave animation
  switches: {
    functionRow: React.RefObject<THREE.Group | null>;
    numberRow: React.RefObject<THREE.Group | null>;
    topRow: React.RefObject<THREE.Group | null>;
    homeRow: React.RefObject<THREE.Group | null>;
    bottomRow: React.RefObject<THREE.Group | null>;
    modifiers: React.RefObject<THREE.Group | null>;
    arrows: React.RefObject<THREE.Group | null>;
  };

  // Keycap groups for easy animation targeting
  keycaps: {
    functionRow: React.RefObject<THREE.Group | null>;
    numberRow: React.RefObject<THREE.Group | null>;
    topRow: React.RefObject<THREE.Group | null>;
    homeRow: React.RefObject<THREE.Group | null>;
    bottomRow: React.RefObject<THREE.Group | null>;
    modifiers: React.RefObject<THREE.Group | null>;
    arrows: React.RefObject<THREE.Group | null>;
  };

  // Individual keycaps for detailed animations
  keys: {
    [key: string]: React.RefObject<THREE.Mesh | null>;
  };

  // Main container
  container: React.RefObject<THREE.Group | null>;
}

interface KeyboardProps extends React.ComponentProps<"group"> {
  keycapMaterial?: THREE.Material;
  knobColor?: string;
}

export const Keyboard = forwardRef<KeyboardRefs, KeyboardProps>(
  ({ ...props }, ref) => {
    const { nodes, materials } = useGLTF(
      "/keyboard.gltf",
    ) as unknown as GLTFResult;

    // Main structure refs
    const containerRef = useRef<THREE.Group>(null);
    const plateRef = useRef<THREE.Mesh>(null);
    const topCaseRef = useRef<THREE.Mesh>(null);
    const weightRef = useRef<THREE.Mesh>(null);
    const screenRef = useRef<THREE.Mesh>(null);
    const knobRef = useRef<THREE.Mesh>(null);

    // Switch group refs
    const switchFunctionRowRef = useRef<THREE.Group>(null);
    const switchNumberRowRef = useRef<THREE.Group>(null);
    const switchTopRowRef = useRef<THREE.Group>(null);
    const switchHomeRowRef = useRef<THREE.Group>(null);
    const switchBottomRowRef = useRef<THREE.Group>(null);
    const switchModifiersRef = useRef<THREE.Group>(null);
    const switchArrowsRef = useRef<THREE.Group>(null);

    // Keycap group refs
    const functionRowRef = useRef<THREE.Group>(null);
    const numberRowRef = useRef<THREE.Group>(null);
    const topRowRef = useRef<THREE.Group>(null);
    const homeRowRef = useRef<THREE.Group>(null);
    const bottomRowRef = useRef<THREE.Group>(null);
    const modifiersRef = useRef<THREE.Group>(null);
    const arrowsRef = useRef<THREE.Group>(null);

    // Individual key refs
    const escRef = useRef<THREE.Mesh>(null);
    const f1Ref = useRef<THREE.Mesh>(null);
    const f2Ref = useRef<THREE.Mesh>(null);
    const f3Ref = useRef<THREE.Mesh>(null);
    const f4Ref = useRef<THREE.Mesh>(null);
    const f5Ref = useRef<THREE.Mesh>(null);
    const f6Ref = useRef<THREE.Mesh>(null);
    const f7Ref = useRef<THREE.Mesh>(null);
    const f8Ref = useRef<THREE.Mesh>(null);
    const f9Ref = useRef<THREE.Mesh>(null);
    const f10Ref = useRef<THREE.Mesh>(null);
    const f11Ref = useRef<THREE.Mesh>(null);
    const f12Ref = useRef<THREE.Mesh>(null);
    const delRef = useRef<THREE.Mesh>(null);
    const graveRef = useRef<THREE.Mesh>(null);
    const oneRef = useRef<THREE.Mesh>(null);
    const twoRef = useRef<THREE.Mesh>(null);
    const threeRef = useRef<THREE.Mesh>(null);
    const fourRef = useRef<THREE.Mesh>(null);
    const fiveRef = useRef<THREE.Mesh>(null);
    const sixRef = useRef<THREE.Mesh>(null);
    const sevenRef = useRef<THREE.Mesh>(null);
    const eightRef = useRef<THREE.Mesh>(null);
    const nineRef = useRef<THREE.Mesh>(null);
    const zeroRef = useRef<THREE.Mesh>(null);
    const dashRef = useRef<THREE.Mesh>(null);
    const equalRef = useRef<THREE.Mesh>(null);
    const backspaceRef = useRef<THREE.Mesh>(null);
    const tabRef = useRef<THREE.Mesh>(null);
    const qRef = useRef<THREE.Mesh>(null);
    const wRef = useRef<THREE.Mesh>(null);
    const eRef = useRef<THREE.Mesh>(null);
    const rRef = useRef<THREE.Mesh>(null);
    const tRef = useRef<THREE.Mesh>(null);
    const yRef = useRef<THREE.Mesh>(null);
    const uRef = useRef<THREE.Mesh>(null);
    const iRef = useRef<THREE.Mesh>(null);
    const oRef = useRef<THREE.Mesh>(null);
    const pRef = useRef<THREE.Mesh>(null);
    const lsquarebracketRef = useRef<THREE.Mesh>(null);
    const rsquarebracketRef = useRef<THREE.Mesh>(null);
    const backslashRef = useRef<THREE.Mesh>(null);
    const pageupRef = useRef<THREE.Mesh>(null);
    const capsRef = useRef<THREE.Mesh>(null);
    const aRef = useRef<THREE.Mesh>(null);
    const sRef = useRef<THREE.Mesh>(null);
    const dRef = useRef<THREE.Mesh>(null);
    const fRef = useRef<THREE.Mesh>(null);
    const gRef = useRef<THREE.Mesh>(null);
    const hRef = useRef<THREE.Mesh>(null);
    const jRef = useRef<THREE.Mesh>(null);
    const kRef = useRef<THREE.Mesh>(null);
    const lRef = useRef<THREE.Mesh>(null);
    const semicolonRef = useRef<THREE.Mesh>(null);
    const quoteRef = useRef<THREE.Mesh>(null);
    const enterRef = useRef<THREE.Mesh>(null);
    const pagedownRef = useRef<THREE.Mesh>(null);
    const lshiftRef = useRef<THREE.Mesh>(null);
    const zRef = useRef<THREE.Mesh>(null);
    const xRef = useRef<THREE.Mesh>(null);
    const cRef = useRef<THREE.Mesh>(null);
    const vRef = useRef<THREE.Mesh>(null);
    const bRef = useRef<THREE.Mesh>(null);
    const nRef = useRef<THREE.Mesh>(null);
    const mRef = useRef<THREE.Mesh>(null);
    const commaRef = useRef<THREE.Mesh>(null);
    const periodRef = useRef<THREE.Mesh>(null);
    const slashRef = useRef<THREE.Mesh>(null);
    const rshiftRef = useRef<THREE.Mesh>(null);
    const arrowupRef = useRef<THREE.Mesh>(null);
    const endRef = useRef<THREE.Mesh>(null);
    const lcontrolRef = useRef<THREE.Mesh>(null);
    const lwinRef = useRef<THREE.Mesh>(null);
    const laltRef = useRef<THREE.Mesh>(null);
    const spaceRef = useRef<THREE.Mesh>(null);
    const raltRef = useRef<THREE.Mesh>(null);
    const fnRef = useRef<THREE.Mesh>(null);
    const arrowleftRef = useRef<THREE.Mesh>(null);
    const arrowdownRef = useRef<THREE.Mesh>(null);
    const arrowrightRef = useRef<THREE.Mesh>(null);

    // Expose refs through imperative handle
    useImperativeHandle(ref, () => ({
      plate: plateRef,
      topCase: topCaseRef,
      weight: weightRef,
      screen: screenRef,
      knob: knobRef,
      switches: {
        functionRow: switchFunctionRowRef,
        numberRow: switchNumberRowRef,
        topRow: switchTopRowRef,
        homeRow: switchHomeRowRef,
        bottomRow: switchBottomRowRef,
        modifiers: switchModifiersRef,
        arrows: switchArrowsRef,
      },
      keycaps: {
        functionRow: functionRowRef,
        numberRow: numberRowRef,
        topRow: topRowRef,
        homeRow: homeRowRef,
        bottomRow: bottomRowRef,
        modifiers: modifiersRef,
        arrows: arrowsRef,
      },
      keys: {
        esc: escRef,
        f1: f1Ref,
        f2: f2Ref,
        f3: f3Ref,
        f4: f4Ref,
        f5: f5Ref,
        f6: f6Ref,
        f7: f7Ref,
        f8: f8Ref,
        f9: f9Ref,
        f10: f10Ref,
        f11: f11Ref,
        f12: f12Ref,
        del: delRef,
        grave: graveRef,
        one: oneRef,
        two: twoRef,
        three: threeRef,
        four: fourRef,
        five: fiveRef,
        six: sixRef,
        seven: sevenRef,
        eight: eightRef,
        nine: nineRef,
        zero: zeroRef,
        dash: dashRef,
        equal: equalRef,
        backspace: backspaceRef,
        tab: tabRef,
        q: qRef,
        w: wRef,
        e: eRef,
        r: rRef,
        t: tRef,
        y: yRef,
        u: uRef,
        i: iRef,
        o: oRef,
        p: pRef,
        lsquarebracket: lsquarebracketRef,
        rsquarebracket: rsquarebracketRef,
        backslash: backslashRef,
        pageup: pageupRef,
        caps: capsRef,
        a: aRef,
        s: sRef,
        d: dRef,
        f: fRef,
        g: gRef,
        h: hRef,
        j: jRef,
        k: kRef,
        l: lRef,
        semicolon: semicolonRef,
        quote: quoteRef,
        enter: enterRef,
        pagedown: pagedownRef,
        lshift: lshiftRef,
        z: zRef,
        x: xRef,
        c: cRef,
        v: vRef,
        b: bRef,
        n: nRef,
        m: mRef,
        comma: commaRef,
        period: periodRef,
        slash: slashRef,
        rshift: rshiftRef,
        arrowup: arrowupRef,
        end: endRef,
        lcontrol: lcontrolRef,
        lwin: lwinRef,
        lalt: laltRef,
        space: spaceRef,
        ralt: raltRef,
        fn: fnRef,
        arrowleft: arrowleftRef,
        arrowdown: arrowdownRef,
        arrowright: arrowrightRef,
      },
      container: containerRef,
    }));

    const keycapTexture = useTexture("/goodwell_uv.png", (texture) => {
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
    });
    
    const keycapMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      map: keycapTexture
    });

    const switchMat = new THREE.MeshStandardMaterial({
      color: "#cccccc",
      roughness: 0.4,
    });

    const switchStemMat = new THREE.MeshStandardMaterial({
      color: "#cccccc",
      roughness: 0.4,
    });

    const switchContactsMat = new THREE.MeshStandardMaterial({
      color: "#cccccc",
      roughness: 0.1,
      metalness: 1,
    });

    return (
      <group {...props} dispose={null} ref={containerRef}>
        <group position={[0.02, 0, 0]}>
          <mesh
            ref={plateRef}
            castShadow
            receiveShadow
            geometry={nodes.Plate.geometry}
            material={keycapMat}
            position={[-0.022, -0.006, -0.057]}
          />
          <mesh
            ref={knobRef}
            castShadow
            receiveShadow
            geometry={nodes.Knob.geometry}
            material={keycapMat}
            position={[0.121, 0.004, -0.106]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.PCB.geometry}
            material={keycapMat}
            position={[-0.022, -0.009, -0.057]}
          />

          {/* Switches - organized by rows with individual meshes for animation */}
          {/* Function Row Switches */}
          <group ref={switchFunctionRowRef}>
            {[
              -0.165, -0.145, -0.126, -0.107, -0.088, -0.069, -0.05, -0.031,
              -0.012, 0.007, 0.026, 0.045, 0.064,
            ].map((x, i) => (
              <group key={`switch-f-${i}`} position={[x, -0.002, -0.106]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Number Row Switches */}
          <group ref={switchNumberRowRef}>
            {[
              -0.165, -0.146, -0.127, -0.108, -0.089, -0.07, -0.051, -0.032,
              -0.013, 0.006, 0.025, 0.044, 0.063, 0.092, 0.121,
            ].map((x, i) => (
              <group key={`switch-n-${i}`} position={[x, -0.002, -0.087]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Top Row Switches */}
          <group ref={switchTopRowRef}>
            {[
              -0.16, -0.136, -0.117, -0.098, -0.079, -0.06, -0.041, -0.022,
              -0.003, 0.016, 0.035, 0.054, 0.073, 0.097, 0.121,
            ].map((x, i) => (
              <group key={`switch-t-${i}`} position={[x, -0.002, -0.068]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Home Row Switches */}
          <group ref={switchHomeRowRef}>
            {[
              -0.158, -0.132, -0.113, -0.094, -0.075, -0.056, -0.037, -0.018,
              0.001, 0.02, 0.039, 0.058, 0.09, 0.121,
            ].map((x, i) => (
              <group key={`switch-h-${i}`} position={[x, -0.002, -0.049]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Bottom Row Switches */}
          <group ref={switchBottomRowRef}>
            {[
              -0.153, -0.122, -0.103, -0.084, -0.065, -0.046, -0.027, -0.008,
              0.011, 0.03, 0.049, 0.076, 0.121,
            ].map((x, i) => (
              <group key={`switch-b-${i}`} position={[x, 0.0, -0.03]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Modifier Switches */}
          <group ref={switchModifiersRef}>
            {[
              [-0.162, -0.011],
              [-0.139, -0.011],
              [-0.115, -0.011],
              [-0.043, -0.01], // Space key
              [0.028, -0.011],
              [0.052, -0.011],
            ].map(([x, z], i) => (
              <group key={`switch-m-${i}`} position={[x, -0.002, z]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Arrow Switches */}
          <group ref={switchArrowsRef}>
            {[
              [0.102, -0.03],
              [0.083, -0.011],
              [0.102, -0.011],
              [0.121, -0.011],
            ].map(([x, z], i) => (
              <group key={`switch-a-${i}`} position={[x, -0.002, z]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          <mesh
            castShadow
            receiveShadow
            geometry={nodes["625u_Wire001"].geometry}
            material={materials.Gold}
            position={[-0.043, -0.001, -0.014]}
            rotation={[Math.PI, 0, Math.PI]}
          />
          <group position={[-0.022, -0.014, -0.057]}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Cube005.geometry}
              material={keycapMat}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Cube005_1.geometry}
              material={keycapMat}
            />
          </group>
          <mesh
            ref={topCaseRef}
            castShadow
            receiveShadow
            geometry={nodes.Top_Case.geometry}
            material={keycapMat}
            position={[-0.022, -0.014, -0.057]}
          />
          <mesh
            ref={weightRef}
            castShadow
            receiveShadow
            geometry={nodes.Weight.geometry}
            material={keycapMat}
            position={[-0.022, -0.014, -0.057]}
          />
          <mesh
            ref={screenRef}
            castShadow
            receiveShadow
            geometry={nodes.Screen.geometry}
            material={keycapMat}
            position={[0.092, 0.001, -0.106]}
            scale={-1}
          />

          {/* Function Row */}
          <group ref={functionRowRef}>
            <mesh
              ref={escRef}
              castShadow
              receiveShadow
              geometry={nodes.K_ESC.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f1Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F1.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f2Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F2.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f3Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F3.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f4Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F4.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f5Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F5.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f6Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F6.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f7Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F7.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f8Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F8.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f9Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F9.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f10Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F10.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f11Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F11.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={f12Ref}
              castShadow
              receiveShadow
              geometry={nodes.K_F12.geometry}
              material={keycapMat}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={delRef}
              castShadow
              receiveShadow
              geometry={nodes.K_DEL.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
          </group>

          {/* Number Row */}
          <group ref={numberRowRef}>
            <mesh
              ref={graveRef}
              castShadow
              receiveShadow
              geometry={nodes.K_GRAVE.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={oneRef}
              castShadow
              receiveShadow
              geometry={nodes.K_1.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={twoRef}
              castShadow
              receiveShadow
              geometry={nodes.K_2.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={threeRef}
              castShadow
              receiveShadow
              geometry={nodes.K_3.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={fourRef}
              castShadow
              receiveShadow
              geometry={nodes.K_4.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={fiveRef}
              castShadow
              receiveShadow
              geometry={nodes.K_5.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={sixRef}
              castShadow
              receiveShadow
              geometry={nodes.K_6.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={sevenRef}
              castShadow
              receiveShadow
              geometry={nodes.K_7.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={eightRef}
              castShadow
              receiveShadow
              geometry={nodes.K_8.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={nineRef}
              castShadow
              receiveShadow
              geometry={nodes.K_9.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={zeroRef}
              castShadow
              receiveShadow
              geometry={nodes.K_0.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={dashRef}
              castShadow
              receiveShadow
              geometry={nodes.K_DASH.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={equalRef}
              castShadow
              receiveShadow
              geometry={nodes.K_EQUAL.geometry}
              material={keycapMat}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={backspaceRef}
              castShadow
              receiveShadow
              geometry={nodes.K_BACKSPACE.geometry}
              material={keycapMat}
              position={[0.092, 0, -0.087]}
            />
          </group>

          {/* Top Row (QWERTY) */}
          <group ref={topRowRef}>
            <mesh
              ref={tabRef}
              castShadow
              receiveShadow
              geometry={nodes.K_TAB.geometry}
              material={keycapMat}
              position={[-0.16, 0.008, -0.068]}
            />
            <mesh
              ref={qRef}
              castShadow
              receiveShadow
              geometry={nodes.K_Q.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={wRef}
              castShadow
              receiveShadow
              geometry={nodes.K_W.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={eRef}
              castShadow
              receiveShadow
              geometry={nodes.K_E.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={rRef}
              castShadow
              receiveShadow
              geometry={nodes.K_R.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={tRef}
              castShadow
              receiveShadow
              geometry={nodes.K_T.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={yRef}
              castShadow
              receiveShadow
              geometry={nodes.K_Y.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={uRef}
              castShadow
              receiveShadow
              geometry={nodes.K_U.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={iRef}
              castShadow
              receiveShadow
              geometry={nodes.K_I.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={oRef}
              castShadow
              receiveShadow
              geometry={nodes.K_O.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={pRef}
              castShadow
              receiveShadow
              geometry={nodes.K_P.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={lsquarebracketRef}
              castShadow
              receiveShadow
              geometry={nodes.K_LSQUAREBRACKET.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={rsquarebracketRef}
              castShadow
              receiveShadow
              geometry={nodes.K_RSQUAREBRACKET.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={backslashRef}
              castShadow
              receiveShadow
              geometry={nodes.K_BACKSLASH.geometry}
              material={keycapMat}
              position={[-0.16, 0.008, -0.068]}
            />
            <mesh
              ref={pageupRef}
              castShadow
              receiveShadow
              geometry={nodes.K_PAGEUP.geometry}
              material={keycapMat}
              position={[-0.136, 0.008, -0.068]}
            />
          </group>

          {/* Home Row (ASDF) */}
          <group ref={homeRowRef}>
            <mesh
              ref={capsRef}
              castShadow
              receiveShadow
              geometry={nodes.K_CAPS.geometry}
              material={keycapMat}
              position={[-0.158, 0, -0.049]}
            />
            <mesh
              ref={aRef}
              castShadow
              receiveShadow
              geometry={nodes.K_A.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={sRef}
              castShadow
              receiveShadow
              geometry={nodes.K_S.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={dRef}
              castShadow
              receiveShadow
              geometry={nodes.K_D.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={fRef}
              castShadow
              receiveShadow
              geometry={nodes.K_F.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={gRef}
              castShadow
              receiveShadow
              geometry={nodes.K_G.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={hRef}
              castShadow
              receiveShadow
              geometry={nodes.K_H.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={jRef}
              castShadow
              receiveShadow
              geometry={nodes.K_J.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={kRef}
              castShadow
              receiveShadow
              geometry={nodes.K_K.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={lRef}
              castShadow
              receiveShadow
              geometry={nodes.K_L.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={semicolonRef}
              castShadow
              receiveShadow
              geometry={nodes.K_SEMICOLON.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={quoteRef}
              castShadow
              receiveShadow
              geometry={nodes.K_QUOTE.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={enterRef}
              castShadow
              receiveShadow
              geometry={nodes.K_ENTER.geometry}
              material={keycapMat}
              position={[0.09, 0, -0.049]}
            />
            <mesh
              ref={pagedownRef}
              castShadow
              receiveShadow
              geometry={nodes.K_PAGEDOWN.geometry}
              material={keycapMat}
              position={[-0.132, 0.007, -0.049]}
            />
          </group>

          {/* Bottom Row (ZXCV) */}
          <group ref={bottomRowRef}>
            <mesh
              ref={lshiftRef}
              castShadow
              receiveShadow
              geometry={nodes.K_LSHIFT.geometry}
              material={keycapMat}
              position={[-0.153, 0, -0.03]}
            />
            <mesh
              ref={zRef}
              castShadow
              receiveShadow
              geometry={nodes.K_Z.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={xRef}
              castShadow
              receiveShadow
              geometry={nodes.K_X.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={cRef}
              castShadow
              receiveShadow
              geometry={nodes.K_C.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={vRef}
              castShadow
              receiveShadow
              geometry={nodes.K_V.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={bRef}
              castShadow
              receiveShadow
              geometry={nodes.K_B.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={nRef}
              castShadow
              receiveShadow
              geometry={nodes.K_N.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={mRef}
              castShadow
              receiveShadow
              geometry={nodes.K_M.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={commaRef}
              castShadow
              receiveShadow
              geometry={nodes.K_COMMA.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={periodRef}
              castShadow
              receiveShadow
              geometry={nodes.K_PERIOD.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={slashRef}
              castShadow
              receiveShadow
              geometry={nodes.K_SLASH.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={rshiftRef}
              castShadow
              receiveShadow
              geometry={nodes.K_RSHIFT.geometry}
              material={keycapMat}
              position={[0.076, 0, -0.03]}
            />
            <mesh
              ref={arrowupRef}
              castShadow
              receiveShadow
              geometry={nodes.K_ARROWUP.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={endRef}
              castShadow
              receiveShadow
              geometry={nodes.K_END.geometry}
              material={keycapMat}
              position={[-0.122, 0.008, -0.03]}
            />
          </group>

          {/* Modifiers */}
          <group ref={modifiersRef}>
            <mesh
              ref={lcontrolRef}
              castShadow
              receiveShadow
              geometry={nodes.K_LCONTROL.geometry}
              material={keycapMat}
              position={[-0.162, 0.008, -0.011]}
            />
            <mesh
              ref={lwinRef}
              castShadow
              receiveShadow
              geometry={nodes.K_LWIN.geometry}
              material={keycapMat}
              position={[-0.162, 0.008, -0.011]}
            />
            <mesh
              ref={laltRef}
              castShadow
              receiveShadow
              geometry={nodes.K_LALT.geometry}
              material={keycapMat}
              position={[-0.162, 0.008, -0.011]}
            />
            <mesh
              ref={spaceRef}
              castShadow
              receiveShadow
              geometry={nodes.K_SPACE.geometry}
              material={keycapMat}
              position={[-0.043, 0, -0.01]}
            />
            <mesh
              ref={raltRef}
              castShadow
              receiveShadow
              geometry={nodes.K_RALT.geometry}
              material={keycapMat}
              position={[-0.162, 0.008, -0.011]}
            />
            <mesh
              ref={fnRef}
              castShadow
              receiveShadow
              geometry={nodes.K_FN.geometry}
              material={keycapMat}
              position={[-0.162, 0.008, -0.011]}
            />
          </group>

          {/* Arrow Keys */}
          <group ref={arrowsRef}>
            <mesh
              ref={arrowleftRef}
              castShadow
              receiveShadow
              geometry={nodes.K_ARROWLEFT.geometry}
              material={keycapMat}
              position={[0.083, 0.008, -0.011]}
            />
            <mesh
              ref={arrowdownRef}
              castShadow
              receiveShadow
              geometry={nodes.K_ARROWDOWN.geometry}
              material={keycapMat}
              position={[0.083, 0.008, -0.011]}
            />
            <mesh
              ref={arrowrightRef}
              castShadow
              receiveShadow
              geometry={nodes.K_ARROWRIGHT.geometry}
              material={keycapMat}
              position={[0.083, 0.008, -0.011]}
            />
          </group>

          <instancedMesh
            args={[nodes["2U_Wires"].geometry, materials.Gold, 3]}
            castShadow
            receiveShadow
            instanceMatrix={nodes["2U_Wires"].instanceMatrix}
            position={[0.092, 0.009, -0.086]}
          />
          <instancedMesh
            args={[nodes.Stab_Housing_Instances.geometry, materials.Stem, 8]}
            castShadow
            receiveShadow
            instanceMatrix={nodes.Stab_Housing_Instances.instanceMatrix}
            position={[0.08, -0.004, -0.085]}
          />
        </group>
      </group>
    );
  },
);

Keyboard.displayName = "Keyboard";

useGLTF.preload("/keyboard.gltf");
