'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Mini draggable card that lives inside the demo canvas ───────────────────

interface DraggableCardProps {
  initialX: number;
  initialY: number;
  canvasScale: number;
  label: string;
  children: React.ReactNode;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  initialX,
  initialY,
  canvasScale,
  label,
  children,
}) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, cardX: 0, cardY: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setDragging(true);
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        cardX: pos.x,
        cardY: pos.y,
      };
    },
    [pos]
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.current.mouseX) / canvasScale;
      const dy = (e.clientY - dragStart.current.mouseY) / canvasScale;
      setPos({ x: dragStart.current.cardX + dx, y: dragStart.current.cardY + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, canvasScale]);

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
        zIndex: dragging ? 100 : 1,
      }}
    >
      {/* Figma-style frame label above the card */}
      <div
        style={{
          position: 'absolute',
          top: -18,
          left: 0,
          fontSize: 10,
          color: dragging ? '#0d99ff' : '#888',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'color 0.1s',
        }}
      >
        {label}
      </div>

      {/* Blue selection border when dragging */}
      {dragging && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            border: '1.5px solid #0d99ff',
            borderRadius: 10,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* Corner resize handles when dragging */}
      {dragging &&
        [
          { top: -4, left: -4 },
          { top: -4, right: -4 },
          { bottom: -4, left: -4 },
          { bottom: -4, right: -4 },
        ].map((style, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 7,
              height: 7,
              background: '#fff',
              border: '1.5px solid #0d99ff',
              borderRadius: 2,
              pointerEvents: 'none',
              zIndex: 11,
              ...style,
            }}
          />
        ))}

      {children}
    </div>
  );
};

// ─── The main FigmaCanvas component ─────────────────────────────────────────

export const FigmaCanvas: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);

  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef.current = pan; }, [pan]);

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
      {/* ── Title bar ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 36,
          background: '#2c2c2c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        {/* macOS traffic lights */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>

        <span style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.04em', fontWeight: 500 }}>
          Figma Canvas
        </span>

        {/* Zoom toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#3a3a3a',
            borderRadius: 6,
            overflow: 'hidden',
            gap: 0,
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
                padding: '3px 8px',
                background: 'transparent',
                color: '#ccc',
                border: 'none',
                fontSize: 11,
                cursor: fn ? 'pointer' : 'default',
                minWidth: label.includes('%') ? 36 : 'auto',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Canvas area ── */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          inset: 0,
          top: 36,
          background: '#f0f0f0',
          backgroundImage: 'radial-gradient(circle, #c8c8c8 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: `${pan.x % 20}px ${pan.y % 20}px`,
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'default',
        }}
      >
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
          {/* Card 1 — primary button */}
          <DraggableCard
            initialX={32}
            initialY={40}
            canvasScale={scale}
            label="Button / Primary"
          >
            <div
              style={{
                width: 160,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                padding: '16px 18px',
              }}
            >
              <div style={{ fontSize: 10, color: '#bbb', marginBottom: 10, fontFamily: 'monospace' }}>
                variant: primary
              </div>
              <button
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '7px 0',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Button
              </button>
            </div>
          </DraggableCard>

          {/* Card 2 — outlined button */}
          <DraggableCard
            initialX={232}
            initialY={40}
            canvasScale={scale}
            label="Button / Outlined"
          >
            <div
              style={{
                width: 160,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                padding: '16px 18px',
              }}
            >
              <div style={{ fontSize: 10, color: '#bbb', marginBottom: 10, fontFamily: 'monospace' }}>
                variant: outlined
              </div>
              <button
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '7px 0',
                  background: 'transparent',
                  color: '#000',
                  border: '1.5px solid #000',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Button
              </button>
            </div>
          </DraggableCard>

          {/* Card 3 — badge / tag */}
          <DraggableCard
            initialX={130}
            initialY={155}
            canvasScale={scale}
            label="Badge / Status"
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>
                status: badges
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: 'Live', bg: '#dcfce7', color: '#16a34a' },
                  { label: 'Draft', bg: '#fef9c3', color: '#ca8a04' },
                  { label: 'Error', bg: '#fee2e2', color: '#dc2626' },
                ].map(({ label, bg, color }) => (
                  <span
                    key={label}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: bg,
                      color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
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
