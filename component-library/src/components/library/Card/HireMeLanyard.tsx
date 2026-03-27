'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import { Canvas as FiberCanvas, useFrame, useThree } from '@react-three/fiber';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { hireMeLanyardCss } from './hireMeLanyardStyles';

const CARD_ASPECT = 1.37;
const ROLE_TITLES = [
  'Software Developer',
  'Frontend Developer',
  'Web Developer',
  'Product Designer',
];

const BAND_VISUAL = {
  lineWidthDesktop: 120,
  lineWidthMobile: 100,
  lineWidthLargeDesktop: 120,
  clipTopDesktopPx: 9,
  clipTopMobilePx: 9,
  tipDockOverlapDesktopPx: 0,
  tipDockOverlapMobilePx: 0,
  tipFrontZOffset: 0.04,
  tipControlLerp: 0.26,
};

const CARD_PHYSICS = {
  gravityScale: 0.72,
  linearDamping: 0.75,
  angularDamping: 3.2,
  springDragged: 6,
  springIdle: 11,
  dampingDragged: 1.8,
  dampingIdle: 3.4,
  maxSpin: 2.2,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizeAngle = (angle: number) =>
  Math.atan2(Math.sin(angle), Math.cos(angle));

function toScreen(
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
  source: THREE.Vector3,
  target: THREE.Vector3
) {
  target.set(source.x, source.y, source.z).project(camera);
  return {
    x: (target.x * 0.5 + 0.5) * size.width,
    y: (-target.y * 0.5 + 0.5) * size.height,
  };
}

function placeOverlay(
  el: HTMLElement | null,
  x: number,
  y: number,
  angle: number
) {
  if (!el) {
    return;
  }

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;

  if (el.style.opacity !== '1') {
    el.style.opacity = '1';
  }
}

function RoleFocusText({ text }: { text: string }) {
  return <span className="hire-role-focus-text">{text}</span>;
}

function Band({
  cardRef,
  cardSize,
}: {
  cardRef: React.RefObject<HTMLElement | null>;
  cardSize: { width: number; height: number };
}) {
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<RapierRigidBody>(null!);
  const j2 = useRef<RapierRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const dragVec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector4(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const j1Lerped = useMemo(() => new THREE.Vector3(), []);
  const j2Lerped = useMemo(() => new THREE.Vector3(), []);
  const tipControlVec = useMemo(() => new THREE.Vector3(), []);
  const attachScreenVec = useMemo(() => new THREE.Vector3(), []);
  const attachVec = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const lineGeometry = useMemo(() => new MeshLineGeometry(), []);
  const jointsReady = useRef(false);
  const { size, camera } = useThree();
  const isMobile = size.width < 768;
  const isLargeDesktop = size.width >= 1400;
  const lineMaterial = useMemo(
    () => {
      const material = new MeshLineMaterial({
        color: '#111111',
        resolution: new THREE.Vector2(size.width, size.height),
        sizeAttenuation: 0,
        lineWidth: isMobile
          ? BAND_VISUAL.lineWidthMobile
          : isLargeDesktop
            ? BAND_VISUAL.lineWidthLargeDesktop
            : BAND_VISUAL.lineWidthDesktop,
      });

      material.depthTest = false;
      material.transparent = false;

      return material;
    },
    [isLargeDesktop, isMobile, size.height, size.width]
  );

  const [curve] = useState(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);

    path.curveType = 'chordal';
    return path;
  });
  const [dragged, setDragged] = useState<THREE.Vector3 | null>(null);

  const cameraDistance = Math.abs(camera.position.z);
  const perspectiveCamera = camera as THREE.PerspectiveCamera;
  const viewportHeightWorld =
    2 *
    Math.tan(THREE.MathUtils.degToRad(perspectiveCamera.fov) / 2) *
    cameraDistance;
  const worldPerPixel = viewportHeightWorld / size.height;
  const cardWorldWidth = cardSize.width * worldPerPixel;
  const cardWorldHeight = cardSize.height * worldPerPixel;
  const clipTopPx = isMobile
    ? BAND_VISUAL.clipTopMobilePx
    : BAND_VISUAL.clipTopDesktopPx;
  const tipDockOverlapPx = isMobile
    ? BAND_VISUAL.tipDockOverlapMobilePx
    : BAND_VISUAL.tipDockOverlapDesktopPx;
  const cardAttachY =
    cardWorldHeight / 2 - (clipTopPx - tipDockOverlapPx) * worldPerPixel;
  const segmentLength = 0.9;

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [lineGeometry, lineMaterial]);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], segmentLength]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], segmentLength]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], segmentLength]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, cardAttachY, 0]]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (!fixed.current || !j1.current || !j2.current || !j3.current || !card.current) {
      return;
    }

    if (!jointsReady.current) {
      j1Lerped.copy(j1.current.translation());
      j2Lerped.copy(j2.current.translation());
      jointsReady.current = true;
    }

    const j1Target = j1.current.translation();
    const j1Distance = j1Lerped.distanceTo(j1Target);
    const j1Clamped = Math.max(0.1, Math.min(1, j1Distance));
    j1Lerped.lerp(j1Target, delta * (2 + j1Clamped * 18));

    const j2Target = j2.current.translation();
    const j2Distance = j2Lerped.distanceTo(j2Target);
    const j2Clamped = Math.max(0.1, Math.min(1, j2Distance));
    j2Lerped.lerp(j2Target, delta * (2 + j2Clamped * 18));

    const cardPos = card.current.translation();
    rot.copy(card.current.rotation());
    quat.set(rot.x, rot.y, rot.z, rot.w);
    euler.setFromQuaternion(quat, 'XYZ');

    attachVec.set(
      cardPos.x,
      cardPos.y + cardAttachY,
      cardPos.z + BAND_VISUAL.tipFrontZOffset
    );

    tipControlVec.copy(attachVec).lerp(j2Lerped, BAND_VISUAL.tipControlLerp);

    curve.points[0].copy(fixed.current.translation());
    curve.points[1].copy(j1Lerped);
    curve.points[2].copy(tipControlVec);
    curve.points[3].copy(attachVec);
    lineGeometry.setPoints(curve.getPoints(32));

    ang.copy(card.current.angvel());

    const spring = dragged
      ? CARD_PHYSICS.springDragged
      : CARD_PHYSICS.springIdle;
    const damping = dragged
      ? CARD_PHYSICS.dampingDragged
      : CARD_PHYSICS.dampingIdle;
    const nextX =
      ang.x - (normalizeAngle(euler.x) * spring + ang.x * damping) * delta;
    const nextY =
      ang.y - (normalizeAngle(euler.y) * spring + ang.y * damping) * delta;
    const nextZ =
      ang.z -
      (normalizeAngle(euler.z) * spring * 1.2 + ang.z * damping) * delta;
    const maxSpin = CARD_PHYSICS.maxSpin;

    card.current.setAngvel(
      {
        x: clamp(nextX, -maxSpin, maxSpin),
        y: clamp(nextY, -maxSpin, maxSpin),
        z: clamp(nextZ, -maxSpin, maxSpin),
      },
      true
    );

    const attachScreen = toScreen(
      camera as THREE.PerspectiveCamera,
      size,
      attachVec,
      attachScreenVec
    );
    const clipAnchorOffset = cardSize.height / 2 - (clipTopPx - tipDockOverlapPx);
    const sinZ = Math.sin(euler.z);
    const cosZ = Math.cos(euler.z);
    const cardCenterX = attachScreen.x - sinZ * clipAnchorOffset;
    const cardCenterY = attachScreen.y + cosZ * clipAnchorOffset;

    placeOverlay(cardRef.current, cardCenterX, cardCenterY, euler.z);
  });

  return (
    <>
      <group position={[0, 3.7, 0]}>
        <RigidBody ref={fixed} type="fixed" angularDamping={2} linearDamping={2} />

        <RigidBody
          ref={j1}
          position={[0, -segmentLength, 0]}
          angularDamping={3}
          linearDamping={3}
          colliders={false}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>

        <RigidBody
          ref={j2}
          position={[0, -segmentLength * 2, 0]}
          angularDamping={3}
          linearDamping={3}
          colliders={false}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>

        <RigidBody
          ref={j3}
          position={[0, -segmentLength * 3, 0]}
          angularDamping={3}
          linearDamping={3}
          colliders={false}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>

        <RigidBody
          ref={card}
          position={[0, -(segmentLength * 3 + cardAttachY), 0]}
          gravityScale={CARD_PHYSICS.gravityScale}
          angularDamping={CARD_PHYSICS.angularDamping}
          linearDamping={CARD_PHYSICS.linearDamping}
          colliders={false}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[cardWorldWidth / 2, cardWorldHeight / 2, 0.02]} />
          <mesh
            onPointerUp={(e) => {
              e.stopPropagation();
              (
                e.target as typeof e.target & {
                  releasePointerCapture?: (pointerId: number) => void;
                }
              ).releasePointerCapture?.(e.pointerId);
              setDragged(null);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              (
                e.target as typeof e.target & {
                  setPointerCapture?: (pointerId: number) => void;
                }
              ).setPointerCapture?.(e.pointerId);
              setDragged(
                dragVec
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
                  .clone()
              );
            }}
          >
            <planeGeometry args={[cardWorldWidth, cardWorldHeight]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </RigidBody>
      </group>

      <mesh
        geometry={lineGeometry}
        material={lineMaterial}
        frustumCulled={false}
      />
    </>
  );
}

export default function HireMeLanyard() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [cardSize, setCardSize] = useState({
    width: 290,
    height: Math.round(290 * CARD_ASPECT),
  });

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return undefined;
    }

    const updateSize = () => {
      const width = clamp(stage.clientWidth * 0.26, 220, 320);
      setCardSize({
        width,
        height: Math.round(width * CARD_ASPECT),
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(stage);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % ROLE_TITLES.length);
    }, 2400);

    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <style>{hireMeLanyardCss}</style>

      <div ref={stageRef} className="hire-r3f-lanyard">
        <FiberCanvas
          className="hire-r3f-lanyard-canvas"
          camera={{ position: [0, 0, 13], fov: 25 }}
          dpr={[1, 2]}
        >
          <Physics gravity={[0, -40, 0]} timeStep={1 / 60} interpolate>
            <Band key={cardSize.width} cardRef={cardRef} cardSize={cardSize} />
          </Physics>
        </FiberCanvas>

        <article
          ref={cardRef}
          className="hire-badge-card"
          style={{
            width: `${cardSize.width}px`,
            height: `${cardSize.height}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            willChange: 'transform, left, top',
          }}
        >
          <div className="hire-badge-card-inner tracking-[-0.09em]">
            <Image
              src="/my-profile-1.png"
              alt="Prince William"
              width={480}
              height={480}
              sizes="320px"
              className="hire-badge-photo"
              draggable={false}
              priority
            />

            <h2 className="hire-badge-name">
              Prince
              <br />
              William
            </h2>

            <p className="hire-badge-role">
              <RoleFocusText key={ROLE_TITLES[roleIndex]} text={ROLE_TITLES[roleIndex]} />
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
