'use client';

import Image from 'next/image';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { projectsCurlCss } from './projectsCurlStyles';

const ENABLE_WEBGL_CURL = true;

type Project = {
    id: string;
    title: string[];
    desc: string[];
    live: string | null;
    code: string | null;
    img: string | null;
    imgW?: number;
    imgH?: number;
};

// Add more projects here — the stack + curl handle any number.
const projects: Project[] = [
    {
        id: 'component-library',
        title: ['Open Source', 'Component Library'],
        desc: ['A small set of reusable, open\u2011source React &', 'Tailwind UI components.'],
        live: 'https://component-library-six-eta.vercel.app',
        code: 'https://github.com/jaiminjariwala/NEXT-JS/tree/main/component-library',
        img: '/images/project-1-shot.png',
        imgW: 2922,
        imgH: 1767,
    },
    {
        id: 'coming-soon',
        title: ['More projects', 'coming soon'],
        desc: ['Cooking up the next one.', 'Check back shortly.'],
        live: null,
        code: null,
        img: null,
    },
];

// Page-paper aspect (matches page-paper.png). Used as the mesh's units.
const PAGE_W = 438;
const PAGE_H = 581;
const MAX_ROT = 150; // degrees the page turns at full progress (CSS fallback)

// Hinge geometry (mesh coords: origin center, +x right, +y up).
const _diag = Math.SQRT1_2; // 0.707
const HINGE = { x: -PAGE_W / 2 + 0.09 * PAGE_W, y: PAGE_H / 2 - 0.08 * PAGE_H };
const HINGE_DIR = { x: _diag, y: _diag };
const HINGE_PERP = { x: _diag, y: -_diag };
const _far = { x: PAGE_W / 2 - HINGE.x, y: -PAGE_H / 2 - HINGE.y };
const HINGE_BMAX = _far.x * HINGE_PERP.x + _far.y * HINGE_PERP.y;
const CURL_A0 = Math.PI * 2;
const CURL_A1 = 1.5;
const NEXT_Z = 8;
const CANVAS_MARGIN = 3.4;

function PageFace({ project }: { project: Project }) {
    return (
        <>
            <Image
                src="/images/page-paper.png"
                alt=""
                aria-hidden="true"
                width={438}
                height={581}
                priority
                className="projects-page-img"
            />

            {project.img && (
                <div className="projects-shot-wrap">
                    <a
                        href={project.live ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${project.title.join(' ')} project`}
                        className="projects-shot-link"
                        draggable={false}
                    >
                        <Image
                            src={project.img}
                            alt={`${project.title.join(' ')} preview`}
                            width={project.imgW ?? 1600}
                            height={project.imgH ?? 1000}
                            priority
                            className="projects-shot-img"
                            draggable={false}
                        />
                    </a>
                    <Image
                        src="/images/selotape.png"
                        alt=""
                        aria-hidden="true"
                        width={947}
                        height={369}
                        className="projects-shot-tape projects-shot-tape-tl"
                        draggable={false}
                    />
                    <Image
                        src="/images/selotape.png"
                        alt=""
                        aria-hidden="true"
                        width={947}
                        height={369}
                        className="projects-shot-tape projects-shot-tape-br"
                        draggable={false}
                    />
                </div>
            )}

            <div className="projects-page-caption">
                <h1 className="projects-page-title">
                    <span className="pc-line">{project.title[0]}</span>
                    <span className="pc-line">{project.title[1]}</span>
                </h1>
                <p className="projects-page-desc">
                    <span className="pc-line">{project.desc[0]}</span>
                    <span className="pc-line">{project.desc[1]}</span>
                </p>
                {project.code && (
                    <a
                        href={project.code}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="projects-github-link"
                        aria-label="Open code on GitHub"
                        draggable={false}
                    >
                        Github
                    </a>
                )}
            </div>
        </>
    );
}

function roundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}

function buildPageTexture(
    stageEl: HTMLElement,
    faceEl: HTMLElement
): THREE.CanvasTexture | null {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const base = stageEl.getBoundingClientRect();
    if (!base.width || !base.height) return null;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(base.width * ratio);
    canvas.height = Math.round(base.height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(ratio, ratio);

    const rel = (el: Element) => {
        const r = el.getBoundingClientRect();
        const x = r.left - base.left;
        const y = r.top - base.top;
        return { x, y, w: r.width, h: r.height, cx: x + r.width / 2, cy: y + r.height / 2 };
    };
    const rotOf = (el: Element) => {
        const t = getComputedStyle(el).transform;
        if (!t || t === 'none') return 0;
        const m = t.match(/matrix\(([^)]+)\)/);
        if (!m) return 0;
        const p = m[1].split(',').map(parseFloat);
        return Math.atan2(p[1], p[0]);
    };
    const fontOf = (cs: CSSStyleDeclaration) =>
        `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`;

    const paper = faceEl.querySelector<HTMLImageElement>('.projects-page-img');
    if (paper && paper.complete) {
        const r = rel(paper);
        ctx.drawImage(paper, r.x, r.y, r.w, r.h);
    }

    const shot = faceEl.querySelector<HTMLImageElement>('.projects-shot-img');
    if (shot && shot.complete) {
        const r = rel(shot);
        ctx.save();
        roundRectPath(ctx, r.x, r.y, r.w, r.h, 4);
        ctx.clip();
        ctx.drawImage(shot, r.x, r.y, r.w, r.h);
        ctx.restore();
    }

    faceEl.querySelectorAll<HTMLImageElement>('.projects-shot-tape').forEach((tape) => {
        if (!tape.complete) return;
        const r = rel(tape);
        const tw = tape.offsetWidth || r.w;
        const th = tape.offsetHeight || r.h;
        ctx.save();
        ctx.globalAlpha = parseFloat(getComputedStyle(tape).opacity) || 1;
        ctx.translate(r.cx, r.cy);
        ctx.rotate(rotOf(tape));
        ctx.drawImage(tape, -tw / 2, -th / 2, tw, th);
        ctx.restore();
    });

    const drawLines = (el: Element | null) => {
        if (!el) return;
        const cs = getComputedStyle(el);
        const ctx2 = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
        ctx.textBaseline = 'top';
        ctx.fillStyle = cs.color;
        ctx.font = fontOf(cs);
        if ('letterSpacing' in ctx2) ctx2.letterSpacing = cs.letterSpacing;
        const strokeW =
            parseFloat((cs as unknown as { webkitTextStrokeWidth: string }).webkitTextStrokeWidth) || 0;
        const fs = parseFloat(cs.fontSize);
        const lh = parseFloat(cs.lineHeight) || fs * 1.2;
        const pad = (lh - fs) / 2;
        el.querySelectorAll<HTMLElement>('.pc-line').forEach((ln) => {
            const r = rel(ln);
            const maxW = r.w + 0.5;
            const drawRow = (txt: string, y: number) => {
                if (strokeW > 0) {
                    ctx.lineWidth = strokeW;
                    ctx.strokeStyle =
                        (cs as unknown as { webkitTextStrokeColor: string }).webkitTextStrokeColor || cs.color;
                    ctx.strokeText(txt, r.x, y);
                }
                ctx.fillText(txt, r.x, y);
            };
            const words = (ln.textContent ?? '').split(' ');
            let line = '';
            let y = r.y + pad;
            for (let i = 0; i < words.length; i++) {
                const test = line ? line + ' ' + words[i] : words[i];
                if (line && ctx.measureText(test).width > maxW) {
                    drawRow(line, y);
                    y += lh;
                    line = words[i];
                } else {
                    line = test;
                }
            }
            if (line) drawRow(line, y);
        });
        if ('letterSpacing' in ctx2) ctx2.letterSpacing = '0px';
    };
    drawLines(faceEl.querySelector('.projects-page-title'));
    drawLines(faceEl.querySelector('.projects-page-desc'));

    const gh = faceEl.querySelector<HTMLElement>('.projects-github-link');
    if (gh) {
        const cs = getComputedStyle(gh);
        const ctx2 = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
        const r = rel(gh);
        const fs = parseFloat(cs.fontSize);
        const lh = parseFloat(cs.lineHeight) || fs * 1.2;
        const pad = (lh - fs) / 2;
        const gy = r.y + pad;
        ctx.textBaseline = 'top';
        ctx.fillStyle = cs.color;
        ctx.font = fontOf(cs);
        if ('letterSpacing' in ctx2) ctx2.letterSpacing = cs.letterSpacing;
        const strokeW =
            parseFloat((cs as unknown as { webkitTextStrokeWidth: string }).webkitTextStrokeWidth) || 0;
        if (strokeW > 0) {
            ctx.lineWidth = strokeW;
            ctx.strokeStyle =
                (cs as unknown as { webkitTextStrokeColor: string }).webkitTextStrokeColor || cs.color;
            ctx.strokeText(gh.textContent ?? '', r.x, gy);
        }
        ctx.fillText(gh.textContent ?? '', r.x, gy);
        ctx.strokeStyle = cs.color;
        ctx.lineWidth = Math.max(1, fs * 0.055);
        const uy = gy + fs * 1.04;
        ctx.beginPath();
        ctx.moveTo(r.x, uy);
        ctx.lineTo(r.x + gh.getBoundingClientRect().width, uy);
        ctx.stroke();
        if ('letterSpacing' in ctx2) ctx2.letterSpacing = '0px';
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
}

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uA0;
  uniform float uA1;
  uniform float uBmax;
  uniform float uZSink;
  uniform vec2 uHinge;
  uniform vec2 uDir;
  uniform vec2 uPerp;
  varying vec2 vUv;
  varying float vShade;
  varying float vFade;
  const float PI = 3.1415926535;
  void main() {
    vUv = uv;
    vec2 p = position.xy;
    vec2 r = p - uHinge;
    float a = dot(r, uDir);
    float b = dot(r, uPerp);
    float bb = b;
    float z = 0.0;
    vShade = 1.0;
    if (b > 0.0) {
      float t = clamp(b / max(uBmax, 0.0001), 0.0, 1.0);
      float a1 = uA1 * (1.0 - smoothstep(0.5, 0.9, uProgress));
      float phi = uProgress * (uA0 + a1 * t);
      bb = b * cos(phi);
      z = b * sin(phi);
      vShade = 1.0 - 0.12 * sin(clamp(phi, 0.0, PI));
    }
    z -= smoothstep(0.5, 1.0, uProgress) * uZSink;
    vFade = 1.0 - smoothstep(0.86, 0.98, uProgress);
    vec2 xy = uHinge + a * uDir + bb * uPerp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(xy, z, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  uniform sampler2D uBackTex;
  varying vec2 vUv;
  varying float vShade;
  varying float vFade;
  void main() {
    if (gl_FrontFacing) {
      vec4 c = texture2D(uTex, vUv);
      if (c.a < 0.02) discard;
      gl_FragColor = vec4(c.rgb * vShade, c.a * vFade);
    } else {
      vec4 bc = texture2D(uBackTex, vec2(1.0 - vUv.x, vUv.y));
      if (bc.a < 0.02) discard;
      gl_FragColor = vec4(bc.rgb * mix(1.0, vShade, 0.5), bc.a * vFade);
    }
  }
`;

function CurlMesh({
    texture,
    progressRef,
}: {
    texture: THREE.Texture;
    progressRef: React.MutableRefObject<number>;
}) {
    const matRef = useRef<THREE.ShaderMaterial | null>(null);
    const backTex = useMemo(() => {
        const t = new THREE.TextureLoader().load('/images/page-paper.png');
        t.colorSpace = THREE.NoColorSpace;
        return t;
    }, []);
    const uniforms = useMemo(
        () => ({
            uProgress: { value: 0 },
            uA0: { value: CURL_A0 },
            uA1: { value: CURL_A1 },
            uBmax: { value: HINGE_BMAX },
            uZSink: { value: NEXT_Z + 40 },
            uHinge: { value: new THREE.Vector2(HINGE.x, HINGE.y) },
            uDir: { value: new THREE.Vector2(HINGE_DIR.x, HINGE_DIR.y) },
            uPerp: { value: new THREE.Vector2(HINGE_PERP.x, HINGE_PERP.y) },
            uTex: { value: texture },
            uBackTex: { value: backTex },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    useEffect(() => {
        if (matRef.current) matRef.current.uniforms.uTex.value = texture;
    }, [texture]);
    useFrame(() => {
        if (matRef.current) matRef.current.uniforms.uProgress.value = progressRef.current;
    });
    return (
        <mesh>
            <planeGeometry args={[PAGE_W, PAGE_H, 90, 120]} />
            <shaderMaterial
                ref={matRef}
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent
                depthTest
                depthWrite
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

const flatVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const flatFragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    if (c.a < 0.02) discard;
    gl_FragColor = c;
  }
`;

function NextMesh({ texture }: { texture: THREE.Texture }) {
    const matRef = useRef<THREE.ShaderMaterial | null>(null);
    const uniforms = useMemo(
        () => ({ uTex: { value: texture } }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    useEffect(() => {
        if (matRef.current) matRef.current.uniforms.uTex.value = texture;
    }, [texture]);
    return (
        <mesh position={[0, 0, -NEXT_Z]}>
            <planeGeometry args={[PAGE_W, PAGE_H]} />
            <shaderMaterial
                ref={matRef}
                uniforms={uniforms}
                vertexShader={flatVertexShader}
                fragmentShader={flatFragmentShader}
                transparent={false}
                depthTest
                depthWrite
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

const CURL_FOV = 14;
const CURL_DIST =
    (PAGE_H / 2 / Math.tan((CURL_FOV * Math.PI) / 180 / 2)) * CANVAS_MARGIN;

function FitCamera() {
    const { camera } = useThree();
    useEffect(() => {
        const cam = camera as THREE.PerspectiveCamera;
        cam.fov = CURL_FOV;
        cam.position.set(0, 0, CURL_DIST);
        cam.near = 1;
        cam.far = CURL_DIST * 2;
        cam.updateProjectionMatrix();
    }, [camera]);
    return null;
}

type DragState = {
    active: boolean;
    moving: boolean;
    startX?: number;
    startY?: number;
    id?: number | null;
    lastT?: number;
    lastAmount?: number;
    vel?: number;
};

function ProjectsCurlStage() {
    const [index, setIndex] = useState(0);
    const [rot, setRot] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
    const [nextTexture, setNextTexture] = useState<THREE.CanvasTexture | null>(null);

    const stageRef = useRef<HTMLDivElement | null>(null);
    const faceRef = useRef<HTMLDivElement | null>(null);
    const nextFaceRef = useRef<HTMLDivElement | null>(null);
    const drag = useRef<DragState>({ active: false, moving: false, startY: 0, id: null });
    const progressRef = useRef(0);
    const rafRef = useRef(0);

    const len = projects.length;
    const current = projects[index];
    const next = projects[(index + 1) % len];
    const hasMultiple = len > 1;

    const setProgress = useCallback((p: number) => {
        const clamped = Math.max(0, Math.min(1, p));
        progressRef.current = clamped;
        setRot(clamped * MAX_ROT);
    }, []);

    const tween = useCallback(
        (target: number, dur: number, onDone?: () => void) => {
            cancelAnimationFrame(rafRef.current);
            const start = progressRef.current;
            const t0 = performance.now();
            const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
            const loop = (now: number) => {
                const k = Math.min(1, (now - t0) / dur);
                setProgress(start + (target - start) * easeOut(k));
                if (k < 1) {
                    rafRef.current = requestAnimationFrame(loop);
                } else if (onDone) {
                    onDone();
                }
            };
            rafRef.current = requestAnimationFrame(loop);
        },
        [setProgress]
    );

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    useEffect(() => {
        if (!ENABLE_WEBGL_CURL) return undefined;
        let cancelled = false;
        const build = async () => {
            const stage = stageRef.current;
            const face = faceRef.current;
            if (!stage || !face) return;
            try {
                if (document?.fonts?.ready) await document.fonts.ready;
                const imgs = Array.from(face.querySelectorAll('img'));
                await Promise.all(
                    imgs.map((img) =>
                        img.complete && img.naturalWidth
                            ? Promise.resolve()
                            : new Promise<void>((res) => {
                                img.addEventListener('load', () => res(), { once: true });
                                img.addEventListener('error', () => res(), { once: true });
                            })
                    )
                );
                if (cancelled) return;
                const tex = buildPageTexture(stage, face);
                if (tex && !cancelled) setTexture(tex);
                if (nextFaceRef.current && !cancelled) {
                    const ntex = buildPageTexture(stage, nextFaceRef.current);
                    if (ntex) setNextTexture(ntex);
                }
            } catch (err) {
                console.warn('[projects] curl texture build failed', err);
            }
        };
        const id = window.setTimeout(build, 150);
        return () => {
            cancelled = true;
            window.clearTimeout(id);
        };
    }, [index]);

    const DRAG_REF = 240;

    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        drag.current = {
            active: true,
            moving: false,
            startX: e.clientX,
            startY: e.clientY,
            id: e.pointerId,
        };
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const st = drag.current;
        if (!st.active) return;
        const amount = ((st.startX ?? 0) - e.clientX + ((st.startY ?? 0) - e.clientY)) / 2;
        if (!st.moving) {
            if (amount < 6) return;
            st.moving = true;
            st.lastT = performance.now();
            st.lastAmount = amount;
            st.vel = 0;
            setAnimating(false);
            if (st.id != null) e.currentTarget.setPointerCapture?.(st.id);
            if (ENABLE_WEBGL_CURL && stageRef.current) {
                if (faceRef.current) {
                    const tex = buildPageTexture(stageRef.current, faceRef.current);
                    if (tex) setTexture(tex);
                }
                if (nextFaceRef.current) {
                    const ntex = buildPageTexture(stageRef.current, nextFaceRef.current);
                    if (ntex) setNextTexture(ntex);
                }
            }
        }
        const now = performance.now();
        const dt = now - (st.lastT ?? now);
        if (dt > 0) st.vel = (amount - (st.lastAmount ?? amount)) / dt;
        st.lastT = now;
        st.lastAmount = amount;
        setProgress(amount / DRAG_REF);
    };

    const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
        const st = drag.current;
        if (!st.active) return;
        const moved = st.moving;
        const vel = st.vel || 0;
        drag.current = { active: false, moving: false, startY: 0, id: null };
        try {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
        } catch {
            // ignore
        }
        if (!moved) return;

        const p = progressRef.current;
        const commit = p > 0.2 || vel > 0.45;
        if (commit) {
            const dur = Math.max(360, (1 - p) * 1100);
            tween(1, dur, () => {
                setIndex((i) => (i + 1) % len);
                setProgress(0);
            });
        } else {
            tween(0, Math.max(220, p * 500));
        }
    };

    const useCurl = ENABLE_WEBGL_CURL && texture && rot > 0;

    return (
        <div
            className="projects-stage"
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            {hasMultiple && (
                <div ref={nextFaceRef} className="projects-card projects-card-behind" aria-hidden="true">
                    <PageFace project={next} />
                </div>
            )}

            <Image
                src="/images/safety-pin.png"
                alt=""
                aria-hidden="true"
                width={1024}
                height={1024}
                className="projects-pin"
                draggable={false}
            />

            <div
                ref={faceRef}
                className="projects-card projects-curl-face"
                style={{
                    transform: `perspective(1200px) rotate3d(0.94, -0.34, 0, ${-rot}deg)`,
                    transformOrigin: '9% 8%',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transition: animating ? 'transform 0.44s cubic-bezier(0.33,0,0.2,1)' : 'none',
                    opacity: useCurl ? 0 : 1,
                    visibility: useCurl ? 'hidden' : 'visible',
                }}
            >
                <PageFace project={current} />
            </div>

            {ENABLE_WEBGL_CURL && texture && (
                <div
                    className="projects-curl-canvas"
                    style={{ opacity: useCurl ? 1 : 0 }}
                    aria-hidden="true"
                >
                    <Canvas
                        gl={{ alpha: true, antialias: true }}
                        dpr={[1, 1.5]}
                        camera={{ fov: CURL_FOV, position: [0, 0, CURL_DIST] }}
                    >
                        <FitCamera />
                        {nextTexture && <NextMesh texture={nextTexture} />}
                        <CurlMesh texture={texture} progressRef={progressRef} />
                    </Canvas>
                </div>
            )}

            <span className="projects-pin-pierce" aria-hidden="true" />
            <Image
                src="/images/safety-pin.png"
                alt=""
                aria-hidden="true"
                width={1024}
                height={1024}
                className="projects-pin projects-pin-front"
                draggable={false}
            />
        </div>
    );
}

export default function ProjectsCurl() {
    return (
        <>
            <style>{projectsCurlCss}</style>
            <div className="projects-embed">
                <ProjectsCurlStage />
            </div>
        </>
    );
}
