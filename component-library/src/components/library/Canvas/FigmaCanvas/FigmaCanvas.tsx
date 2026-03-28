'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnalogClock } from '@/components/library/Clock/AnalogClock/AnalogClock';
import { DateCalendar } from '@/components/library/Calendar/DateCalendar/DateCalendar';

// ─── Mini draggable card that lives inside the demo canvas ───────────────────

const FIGMA_CANVAS_VIEW_STORAGE_KEY = 'component-library:figma-canvas:view:v1';

type PersistedCardLayout = {
  x: number;
  y: number;
  scale: number;
};

type PersistedCanvasView = {
  scale: number;
  pan: { x: number; y: number };
};

function readPersistedCardLayout(storageKey: string) {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedCardLayout>;
    if (
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number' ||
      typeof parsed.scale !== 'number'
    ) {
      return null;
    }

    return parsed as PersistedCardLayout;
  } catch {
    return null;
  }
}

function readPersistedCanvasView() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(FIGMA_CANVAS_VIEW_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedCanvasView>;
    if (
      typeof parsed.scale !== 'number' ||
      typeof parsed.pan?.x !== 'number' ||
      typeof parsed.pan?.y !== 'number'
    ) {
      return null;
    }

    return parsed as PersistedCanvasView;
  } catch {
    return null;
  }
}

function getInitialCardPosition(storageKey: string, initialX: number, initialY: number) {
  const persistedLayout = readPersistedCardLayout(storageKey);
  if (!persistedLayout) {
    return { x: initialX, y: initialY };
  }

  return { x: persistedLayout.x, y: persistedLayout.y };
}

function getInitialCardScale(
  storageKey: string,
  initialFrameScale: number,
  minFrameScale: number,
  maxFrameScale: number
) {
  const persistedLayout = readPersistedCardLayout(storageKey);
  if (!persistedLayout) return initialFrameScale;

  return Math.min(
    Math.max(persistedLayout.scale, minFrameScale),
    maxFrameScale
  );
}

function getInitialCanvasView() {
  const persistedView = readPersistedCanvasView();
  if (!persistedView) {
    return {
      scale: 1,
      pan: { x: 0, y: 0 },
    };
  }

  return {
    scale: Math.min(Math.max(persistedView.scale, 0.2), 4),
    pan: persistedView.pan,
  };
}

interface DraggableCardProps {
  storageKey: string;
  initialX: number;
  initialY: number;
  canvasScale: number;
  label: string;
  initialFrameScale: number;
  minFrameScale?: number;
  maxFrameScale?: number;
  selectionRadius?: number;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  storageKey,
  initialX,
  initialY,
  canvasScale,
  label,
  initialFrameScale,
  minFrameScale = 0.35,
  maxFrameScale = 1.15,
  selectionRadius = 10,
  selected,
  onSelect,
  children,
}) => {
  const [pos, setPos] = useState(() =>
    getInitialCardPosition(storageKey, initialX, initialY)
  );
  const [dragging, setDragging] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<null | 'nw' | 'ne' | 'sw' | 'se'>(null);
  const [frameScale, setFrameScale] = useState(() =>
    getInitialCardScale(
      storageKey,
      initialFrameScale,
      minFrameScale,
      maxFrameScale
    )
  );
  const [contentSize, setContentSize] = useState({ width: 1, height: 1 });
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({
    mouseX: 0,
    mouseY: 0,
    cardX: 0,
    cardY: 0,
    frameScale: initialFrameScale,
  });

  const frameWidth = contentSize.width;
  const frameHeight = contentSize.height;
  const showSelection = selected || dragging || !!resizeHandle;
  const scaledSelectionRadius = selectionRadius * frameScale;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          x: pos.x,
          y: pos.y,
          scale: frameScale,
        } satisfies PersistedCardLayout)
      );
    } catch {}
  }, [frameScale, pos.x, pos.y, storageKey]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const measure = () => {
      const width = Math.max(node.scrollWidth, node.offsetWidth, 1);
      const height = Math.max(node.scrollHeight, node.offsetHeight, 1);
      setContentSize({ width, height });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [children]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect();
      setDragging(true);
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        cardX: pos.x,
        cardY: pos.y,
        frameScale,
      };
    },
    [frameScale, onSelect, pos]
  );

  const onResizeHandleMouseDown = useCallback(
    (handle: 'nw' | 'ne' | 'sw' | 'se') => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect();
      setResizeHandle(handle);
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        cardX: pos.x,
        cardY: pos.y,
        frameScale,
      };
    },
    [frameScale, onSelect, pos]
  );

  useEffect(() => {
    if (!dragging && !resizeHandle) return;

    const onMove = (e: MouseEvent) => {
      if (dragging) {
        const dx = (e.clientX - dragStart.current.mouseX) / canvasScale;
        const dy = (e.clientY - dragStart.current.mouseY) / canvasScale;
        setPos({ x: dragStart.current.cardX + dx, y: dragStart.current.cardY + dy });
        return;
      }

      if (!resizeHandle) return;

      const horizontalDelta = (e.clientX - dragStart.current.mouseX) / canvasScale;
      const verticalDelta = (e.clientY - dragStart.current.mouseY) / canvasScale;
      const signedHorizontal = resizeHandle.includes('e') ? horizontalDelta : -horizontalDelta;
      const signedVertical = resizeHandle.includes('s') ? verticalDelta : -verticalDelta;
      const delta = Math.max(signedHorizontal, signedVertical);
      const nextScale = Math.min(
        Math.max(
          dragStart.current.frameScale + delta / Math.max(frameWidth, frameHeight),
          minFrameScale
        ),
        maxFrameScale
      );

      const deltaWidth = frameWidth * (nextScale - dragStart.current.frameScale);
      const deltaHeight = frameHeight * (nextScale - dragStart.current.frameScale);

      let nextX = dragStart.current.cardX;
      let nextY = dragStart.current.cardY;

      if (resizeHandle.includes('w')) nextX = dragStart.current.cardX - deltaWidth;
      if (resizeHandle.includes('n')) nextY = dragStart.current.cardY - deltaHeight;

      setFrameScale(nextScale);
      setPos({ x: nextX, y: nextY });
    };

    const onUp = () => {
      setDragging(false);
      setResizeHandle(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [
    canvasScale,
    dragging,
    frameHeight,
    frameWidth,
    maxFrameScale,
    minFrameScale,
    resizeHandle,
  ]);

  return (
    <div
      data-figma-card
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: showSelection ? 100 : 1,
        width: frameWidth * frameScale,
        height: frameHeight * frameScale,
      }}
    >
      {/* Figma-style frame label above the card */}
      <div
        style={{
          position: 'absolute',
          top: -18,
          left: 0,
          fontSize: 10,
          color: showSelection ? '#0d99ff' : '#888',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'color 0.1s',
        }}
      >
        {label}
      </div>

      {/* Blue selection border when dragging */}
      {showSelection && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            border: '2.5px solid #0d99ff',
            borderRadius: scaledSelectionRadius,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* Corner resize handles when dragging */}
      {showSelection &&
        [
          { handle: 'nw' as const, top: -4, left: -4, cursor: 'nwse-resize' },
          { handle: 'ne' as const, top: -4, right: -4, cursor: 'nesw-resize' },
          { handle: 'sw' as const, bottom: -4, left: -4, cursor: 'nesw-resize' },
          { handle: 'se' as const, bottom: -4, right: -4, cursor: 'nwse-resize' },
        ].map(({ handle, cursor, ...style }) => (
          <div
            key={handle}
            onMouseDown={onResizeHandleMouseDown(handle)}
            style={{
              position: 'absolute',
              width: 7,
              height: 7,
              background: '#fff',
              border: '2px solid #0d99ff',
              borderRadius: 0,
              cursor,
              zIndex: 11,
              ...style,
            }}
          />
        ))}

      <div
        ref={contentRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          display: 'inline-block',
          width: 'max-content',
          height: 'max-content',
          transform: `scale(${frameScale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── The main FigmaCanvas component ─────────────────────────────────────────

export const FigmaCanvas: React.FC = () => {
  const initialView = getInitialCanvasView();
  const [scale, setScale] = useState(initialView.scale);
  const [pan, setPan] = useState(initialView.pan);
  const [isPanning, setIsPanning] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);

  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(
        FIGMA_CANVAS_VIEW_STORAGE_KEY,
        JSON.stringify({
          scale,
          pan,
        } satisfies PersistedCanvasView)
      );
    } catch {}
  }, [pan, scale]);

  // Ctrl/Cmd + scroll → zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const cs = scaleRef.current;
        const cp = panRef.current;
        const px = (mx - cp.x) / cs;
        const py = (my - cp.y) / cs;
        const delta = e.deltaY * -0.008;
        const ns = Math.min(Math.max(0.2, cs + delta), 4);
        setScale(ns);
        setPan({ x: mx - px * ns, y: my - py * ns });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Click & drag canvas background → pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-figma-card]')) return;
    e.preventDefault();
    setSelectedCardId(null);
    isPanningRef.current = true;
    setIsPanning(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const zoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setScale((s) => Math.min(+(s + 0.25).toFixed(2), 4)); };
  const zoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setScale((s) => Math.max(+(s - 0.25).toFixed(2), 0.2)); };
  const resetView = (e: React.MouseEvent) => { e.stopPropagation(); setScale(1); setPan({ x: 0, y: 0 }); };

  return (
    <div
      style={{
        width: 480,
        height: 340,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 28px rgba(0,0,0,0.16)',
        border: '1px solid #e0e0e0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* ── Canvas area ── */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#f0f0f0',
          backgroundImage: 'radial-gradient(circle, #c8c8c8 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: `${pan.x % 20}px ${pan.y % 20}px`,
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'default',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {([
            { label: '+', fn: zoomIn },
            { label: `${Math.round(scale * 100)}%`, fn: undefined },
            { label: '−', fn: zoomOut },
            { label: '↺', fn: resetView },
          ] as { label: string; fn: ((e: React.MouseEvent) => void) | undefined }[]).map(({ label, fn }, i) => (
            <button
              key={i}
              onClick={fn ?? undefined}
              style={{
                padding: '5px 8px',
                background: '#F5F5F5',
                color: '#000000',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 400,
                cursor: fn ? 'pointer' : 'default',
                minWidth: label.includes('%') ? 52 : 'auto',
                textAlign: 'center',
                lineHeight: 1.1,
                boxShadow: 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* World transform layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Component 1 — Analog Clock V1 */}
          <DraggableCard
            storageKey="component-library:figma-canvas:analog-clock-v1"
            initialX={18}
            initialY={18}
            canvasScale={scale}
            label="Clock / Analog V1"
            initialFrameScale={0.5}
            minFrameScale={0.38}
            maxFrameScale={0.78}
            selectionRadius={64}
            selected={selectedCardId === 'analog-clock-v1'}
            onSelect={() => setSelectedCardId('analog-clock-v1')}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AnalogClock />
            </div>
          </DraggableCard>

          {/* Component 2 — Date Calendar */}
          <DraggableCard
            storageKey="component-library:figma-canvas:date-calendar"
            initialX={250}
            initialY={88}
            canvasScale={scale}
            label="Calendar / Date"
            initialFrameScale={0.66}
            minFrameScale={0.5}
            maxFrameScale={0.96}
            selectionRadius={20}
            selected={selectedCardId === 'date-calendar'}
            onSelect={() => setSelectedCardId('date-calendar')}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              <DateCalendar />
            </div>
          </DraggableCard>
        </div>
      </div>

      {/* ── Bottom hint ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 7,
          right: 10,
          fontSize: 10,
          color: '#aaa',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        ⌘ scroll to zoom · drag to pan
      </div>
    </div>
  );
};
