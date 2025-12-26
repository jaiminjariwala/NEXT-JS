"use client";

import React, { useState, useEffect, useRef, startTransition } from "react";
import { DraggableItem } from "../DraggableItem/DraggableItem";
import { CodeModal } from "../CodeModal/CodeModal";
import { showcaseItems } from "@/data/componentsData";
import { ShowcaseItem } from "@/types";

interface CanvasProps {
  highlightedItemId?: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ highlightedItemId }) => {
  // Initialize component positions - start with empty array to avoid hydration mismatch
  const [items, setItems] = useState<
    Array<{ id: string; position: { x: number; y: number } }>
  >([]);

  // Set initial positions only on client side
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const initialItems = showcaseItems.map((item, index) => ({
      id: item.id,
      position: isMobile
        ? { x: 20, y: 20 + index * 400 }
        : { x: 50 + (index % 3) * 450, y: 50 + Math.floor(index / 3) * 400 },
    }));

    // Use startTransition to mark this as a non-urgent update
    startTransition(() => {
      setItems(initialItems);
    });
  }, []);

  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Refs for canvas interaction
  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });

  // Update item position after drag
  const handlePositionUpdate = (
    id: string,
    newPosition: { x: number; y: number }
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, position: newPosition } : item
      )
    );
  };

  // Open code modal when item is clicked
  const handleItemClick = (item: ShowcaseItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Refs to track current scale and pan for wheel handler
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);

  // Keep refs in sync with state
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // Handle zoom with Ctrl/Cmd + Mouse Wheel - Figma-like zoom towards cursor
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Use refs to get current values
        const currentScale = scaleRef.current;
        const currentPan = panRef.current;

        // Calculate the point in canvas space (before zoom)
        const pointX = (mouseX - currentPan.x) / currentScale;
        const pointY = (mouseY - currentPan.y) / currentScale;

        // Calculate new scale
        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(0.1, currentScale + delta), 3);

        // Calculate new pan to keep the point under cursor
        const newPanX = mouseX - pointX * newScale;
        const newPanY = mouseY - pointY * newScale;

        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => canvas?.removeEventListener("wheel", handleWheel);
  }, []);

  // Handle canvas panning - Figma-like behavior
  useEffect(() => {
    const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Don't pan if an item is being dragged
      if (canvasRef.current?.hasAttribute("data-item-dragging")) {
        return;
      }

      // Only pan on left click, middle click, or Shift + left click
      // Don't pan if clicking on a draggable item
      const target = e.target as HTMLElement;
      const isDraggableItem = target.closest("[data-draggable-item]");

      if (isDraggableItem) {
        // Let the draggable item handle the drag
        return;
      }

      // Start panning on middle click, Shift + left click, or left click on empty space
      if (
        e.button === 1 ||
        (e.button === 0 && e.shiftKey) ||
        (e.button === 0 && !isDraggableItem)
      ) {
        e.preventDefault();
        isPanningRef.current = true;
        setIsPanning(true);
        const coords = getEventCoordinates(e);
        lastPanPointRef.current = { x: coords.x, y: coords.y };
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Don't pan if an item is being dragged
      if (canvasRef.current?.hasAttribute("data-item-dragging")) {
        return;
      }

      // Don't pan if touching a draggable item
      const target = e.target as HTMLElement;
      const isDraggableItem = target.closest("[data-draggable-item]");

      if (isDraggableItem || e.touches.length !== 1) {
        return;
      }

      e.preventDefault();
      isPanningRef.current = true;
      setIsPanning(true);
      const coords = getEventCoordinates(e);
      lastPanPointRef.current = { x: coords.x, y: coords.y };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isPanningRef.current) return;

      const coords = getEventCoordinates(e);
      const deltaX = coords.x - lastPanPointRef.current.x;
      const deltaY = coords.y - lastPanPointRef.current.y;
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      lastPanPointRef.current = { x: coords.x, y: coords.y };
    };

    const handleEnd = () => {
      isPanningRef.current = false;
      setIsPanning(false);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchend", handleEnd);
      document.addEventListener("touchcancel", handleEnd);
    }

    return () => {
      canvas?.removeEventListener("mousedown", handleMouseDown);
      canvas?.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  }, []);

  return (
    <>
      <div
        className="relative w-full h-screen overflow-hidden dot-grid-bg"
        ref={canvasRef}
        data-canvas-container
        style={{
          cursor: isPanning ? "grabbing" : "grab",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: "24px 24px",
        }}
      >
        {/* Zoom controls - top right corner */}
        <div className="absolute top-10 md:top-4 right-4 z-10 flex flex-row bg-white rounded items-center">
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}
            className="px-4 hover:bg-[#000000] hover:text-white rounded-xs transition-colors text-xl font-light"
          >
            +
          </button>
          <span className="px-2 py-0.5 text-sm font-medium">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
            className="px-4 hover:bg-[#000000] hover:text-white rounded-xs transition-colors text-xl font-light"
          >
            -
          </button>
          <button
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-4 py-1.5 hover:bg-[#000000] hover:text-white rounded-xs transition-colors text-sm font-medium text-black"
          >
            Reset
          </button>
        </div>

        {/* Canvas with zoom and pan */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Render all draggable items */}
          {items.map((item) => {
            const showcaseItem = showcaseItems.find((s) => s.id === item.id);
            if (!showcaseItem) return null;

            const Component = showcaseItem.component;
            const isHighlighted = highlightedItemId === item.id;

            return (
              <DraggableItem
                key={item.id}
                id={item.id}
                position={item.position}
                onPositionUpdate={handlePositionUpdate}
                onClick={() => handleItemClick(showcaseItem)}
                isHighlighted={isHighlighted}
              >
                <Component />
              </DraggableItem>
            );
          })}
        </div>
      </div>

      {/* Code modal */}
      {selectedItem && (
        <CodeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          code={selectedItem.code}
          componentName={selectedItem.name}
          component={selectedItem.component}
        />
      )}
    </>
  );
};
