"use client";

import React, { useState, useEffect, useRef, startTransition } from "react";
import { DraggableItem } from "../DraggableItem/DraggableItem";
import { CodeModal } from "../CodeModal/CodeModal";
import { showcaseItems } from "@/data/componentsData";
import { ShowcaseItem } from "@/types";
import { organizeGridLayout } from "@/utils/layoutUtils";

interface CanvasProps {
  highlightedItemId?: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ highlightedItemId }) => {
  const [items, setItems] = useState<
    Array<{ id: string; position: { x: number; y: number } }>
  >([]);
  // Set initial positions using smart layout
  useEffect(() => {
    // Account for sidebar width (200px on desktop, 0 on mobile)
    const sidebarWidth = window.innerWidth >= 768 ? 200 : 0;
    const viewportWidth = window.innerWidth - sidebarWidth;
    const viewportHeight = window.innerHeight;
    
    console.log('Canvas dimensions:', { viewportWidth, sidebarWidth, totalWidth: window.innerWidth });
    
    const positions = organizeGridLayout(showcaseItems, viewportWidth, viewportHeight);
    
    console.log('Organizing layout:', positions);
    setItems(positions);
  }, []);

  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });

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

  const handleItemClick = (item: ShowcaseItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleReorganize = () => {
    // Account for sidebar width (200px on desktop, 0 on mobile)
    const sidebarWidth = window.innerWidth >= 768 ? 200 : 0;
    const viewportWidth = window.innerWidth - sidebarWidth;
    const viewportHeight = window.innerHeight;
    
    const positions = organizeGridLayout(showcaseItems, viewportWidth, viewportHeight);
    
    setItems(positions);
  };

  const scaleRef = useRef(scale);
  const panRef = useRef(pan);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const currentScale = scaleRef.current;
        const currentPan = panRef.current;

        const pointX = (mouseX - currentPan.x) / currentScale;
        const pointY = (mouseY - currentPan.y) / currentScale;

        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(0.1, currentScale + delta), 3);

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

  useEffect(() => {
    const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (canvasRef.current?.hasAttribute("data-item-dragging")) {
        return;
      }

      const target = e.target as HTMLElement;
      const isDraggableItem = target.closest("[data-draggable-item]");

      if (isDraggableItem) {
        return;
      }

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
      if (canvasRef.current?.hasAttribute("data-item-dragging")) {
        return;
      }

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
        <div className="absolute top-10 md:top-4 right-4 z-10">
          {/* Zoom Controls */}
          <div className="flex flex-row bg-white rounded items-center shadow-md">
            <button
              onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}
              className="px-4 hover:bg-[#000000] hover:text-white rounded-xs transition-colors text-xl font-light"
              title="Zoom In"
            >
              +
            </button>
            <span className="px-2 py-0.5 text-sm font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
              className="px-4 hover:bg-[#000000] hover:text-white rounded-xs transition-colors text-xl font-light"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => {
                setScale(1);
                setPan({ x: 0, y: 0 });
                handleReorganize();
              }}
              className="px-4 py-1.5 hover:bg-[#000000] hover:text-white rounded-xs transition-colors text-sm font-medium text-black"
              title="Reset View & Reorganize Layout"
            >
              Reset
            </button>
          </div>
        </div>

        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
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

      {selectedItem && (
        <CodeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          code={selectedItem.code}
          componentName={selectedItem.name}
          component={selectedItem.hidePreview ? undefined : selectedItem.component}
        />
      )}
    </>
  );
};
