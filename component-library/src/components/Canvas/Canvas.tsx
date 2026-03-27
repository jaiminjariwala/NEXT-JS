"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import {
  DraggableItem,
  ITEM_PREVIEW_SCALE,
} from "../DraggableItem/DraggableItem";
import { CodeModal } from "../CodeModal/CodeModal";
import { showcaseItems } from "@/data/componentsData";
import { ShowcaseItem } from "@/types";
import { getComponentSize, organizeGridLayout } from "@/utils/layoutUtils";

interface CanvasProps {
  highlightedItemId?: string | null;
  onSearchClick: () => void;
}

type ItemSizeMap = Record<string, { width: number; height: number }>;
type ViewMode = "canvas" | "grid";

const getItemPreviewScale = (itemId: string) => {
  switch (itemId) {
    case "card-v1":
      return 0.58;
    default:
      return ITEM_PREVIEW_SCALE;
  }
};

const getItemPreviewWidth = (itemId: string) => {
  switch (itemId) {
    case "card-v2":
      return 640;
    default:
      return undefined;
  }
};

const getCanvasPreviewFrameStyle = (itemId: string) => {
  switch (itemId) {
    case "hire-me-lanyard-1":
      return {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 560,
        height: 600,
        borderRadius: 28,
        background: "#ffffff",
        boxSizing: "border-box" as const,
        ["--hire-r3f-width" as string]: "560px",
      };
    default:
      return undefined;
  }
};

const getCanvasLayout = (measuredSizes: ItemSizeMap = {}) => {
  const viewportWidth = window.innerWidth;
  return organizeGridLayout(showcaseItems, viewportWidth, measuredSizes);
};

const areSizeMapsEqual = (first: ItemSizeMap, second: ItemSizeMap) => {
  const firstEntries = Object.entries(first);
  const secondEntries = Object.entries(second);

  if (firstEntries.length !== secondEntries.length) {
    return false;
  }

  return firstEntries.every(([id, size]) => {
    const otherSize = second[id];
    return (
      otherSize &&
      otherSize.width === size.width &&
      otherSize.height === size.height
    );
  });
};

export const Canvas: React.FC<CanvasProps> = ({
  highlightedItemId,
  onSearchClick,
}) => {
  const [items, setItems] = useState<
    Array<{ id: string; position: { x: number; y: number } }>
  >([]);
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [measuredSizes, setMeasuredSizes] = useState<ItemSizeMap>({});
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const gridFeedRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });
  const [gridViewportWidth, setGridViewportWidth] = useState(0);

  const applyGridLayout = useCallback(
    (sizeMap: ItemSizeMap = measuredSizes) => {
      setItems(getCanvasLayout(sizeMap));
    },
    [measuredSizes]
  );

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
    applyGridLayout();
  };

  const getItemPreviewSize = useCallback(
    (item: ShowcaseItem) => measuredSizes[item.id] ?? getComponentSize(item),
    [measuredSizes]
  );

  const scaleRef = useRef(scale);
  const panRef = useRef(pan);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      applyGridLayout();
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [applyGridLayout]);

  useEffect(() => {
    const measureItems = () => {
      if (!canvasRef.current || !items.length) {
        return;
      }

      const nextSizes = Array.from(
        canvasRef.current.querySelectorAll<HTMLElement>("[data-item-id]")
      ).reduce<ItemSizeMap>((accumulator, element) => {
        const itemId = element.dataset.itemId;
        if (!itemId) {
          return accumulator;
        }

        const previewScale = getItemPreviewScale(itemId);
        accumulator[itemId] = {
          width: Math.ceil(element.offsetWidth * previewScale),
          height: Math.ceil(element.offsetHeight * previewScale),
        };

        return accumulator;
      }, {});

      if (areSizeMapsEqual(measuredSizes, nextSizes)) {
        return;
      }

      setMeasuredSizes(nextSizes);
      applyGridLayout(nextSizes);
    };

    const animationFrame = requestAnimationFrame(measureItems);
    return () => cancelAnimationFrame(animationFrame);
  }, [items, measuredSizes, applyGridLayout]);

  useEffect(() => {
    let animationFrame = 0;

    const handleResize = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        applyGridLayout();
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, [applyGridLayout]);

  useEffect(() => {
    if (viewMode !== "grid" || !gridFeedRef.current) {
      return;
    }

    const gridFeed = gridFeedRef.current;
    let animationFrame = 0;

    const updateGridViewportWidth = () => {
      setGridViewportWidth(gridFeed.clientWidth);
    };

    animationFrame = requestAnimationFrame(updateGridViewportWidth);

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateGridViewportWidth);
    });

    observer.observe(gridFeed);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [viewMode]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleWheel = (e: WheelEvent) => {
      if (!canvas || viewMode !== "canvas") return;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

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
        return;
      }

      if (canvas.hasAttribute("data-item-dragging")) {
        return;
      }

      e.preventDefault();
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    };

    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => canvas?.removeEventListener("wheel", handleWheel);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "canvas") {
      return;
    }

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
  }, [viewMode]);

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <button
        onClick={onSearchClick}
        className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/95 px-4 py-2.5 text-sm font-medium text-black shadow-md transition-colors hover:bg-black hover:text-white"
        title="Open search"
      >
        <Search size={16} strokeWidth={2.25} />
        <span>Cmd+K to search</span>
      </button>

      {viewMode === "canvas" && (
        <div className="flex flex-row items-center rounded-2xl bg-white/95 shadow-md ring-1 ring-black/10">
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}
            className="px-4 py-2 text-xl font-light transition-colors hover:bg-[#000000] hover:text-white rounded-l-2xl"
            title="Zoom In"
          >
            +
          </button>
          <span className="px-2 py-0.5 text-sm font-medium">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
            className="px-4 py-2 text-xl font-light transition-colors hover:bg-[#000000] hover:text-white"
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
            className="px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#000000] hover:text-white rounded-r-2xl"
            title="Reset View & Reorganize Layout"
          >
            Reset
          </button>
        </div>
      )}

      <div className="flex items-center rounded-2xl bg-white/95 p-1 shadow-md ring-1 ring-black/10">
        <button
          onClick={() => setViewMode("canvas")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === "canvas"
              ? "bg-black text-white"
              : "text-black hover:bg-black/5"
          }`}
          type="button"
        >
          Canvas
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === "grid"
              ? "bg-black text-white"
              : "text-black hover:bg-black/5"
          }`}
          type="button"
        >
          Grid
        </button>
      </div>
    </div>
  );

  const gridPreviewSizes = showcaseItems.reduce<ItemSizeMap>((accumulator, item) => {
    const size = getItemPreviewSize(item);
    const maxWidth = Math.max(gridViewportWidth - 16, 220);

    if (size.width > maxWidth) {
      const fitScale = maxWidth / size.width;
      accumulator[item.id] = {
        width: Math.round(size.width * fitScale),
        height: Math.round(size.height * fitScale),
      };
      return accumulator;
    }

    accumulator[item.id] = size;
    return accumulator;
  }, {});

  const gridPositions =
    gridViewportWidth > 0
      ? organizeGridLayout(showcaseItems, gridViewportWidth, gridPreviewSizes, {
          padding: {
            top: 4,
            right: 6,
            bottom: 16,
            left: 6,
          },
          gap: 8,
          snap: 2,
        })
      : [];

  const gridPositionMap = Object.fromEntries(
    gridPositions.map((item) => [item.id, item.position])
  );

  const gridHeight =
    gridPositions.reduce((maxHeight, item) => {
      const size = gridPreviewSizes[item.id];
      if (!size) {
        return maxHeight;
      }

      return Math.max(maxHeight, item.position.y + size.height);
    }, 0) + 16;

  return (
    <>
      {viewMode === "canvas" ? (
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
          <div className="absolute top-4 left-4 z-10">{toolbar}</div>

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
              const previewWidth = getItemPreviewWidth(item.id);
              const previewFrameStyle = getCanvasPreviewFrameStyle(item.id);

              return (
                <DraggableItem
                  key={item.id}
                  id={item.id}
                  position={item.position}
                  onPositionUpdate={handlePositionUpdate}
                  onClick={() => handleItemClick(showcaseItem)}
                  isHighlighted={isHighlighted}
                  previewScale={getItemPreviewScale(item.id)}
                >
                  <div style={previewFrameStyle}>
                    <div
                      style={previewWidth ? { width: previewWidth } : undefined}
                    >
                      <Component />
                    </div>
                  </div>
                </DraggableItem>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-screen overflow-y-auto overflow-x-hidden dot-grid-bg">
          <div className="sticky top-0 z-10 px-4 pt-4 pb-3 backdrop-blur-sm">
            {toolbar}
          </div>

          <div className="px-2 pb-8 pt-1">
            <div
              ref={gridFeedRef}
              className="relative min-h-[40vh] w-full"
              style={{ height: gridHeight || undefined }}
            >
              {gridViewportWidth > 0 &&
                showcaseItems.map((item) => {
                  const Component = item.component;
                  const baseSize = getItemPreviewSize(item);
                  const size = gridPreviewSizes[item.id];
                  const position = gridPositionMap[item.id];
                  const previewWidth = getItemPreviewWidth(item.id);

                  if (!size || !position || item.hidePreview) {
                    return null;
                  }

                  const previewScale = getItemPreviewScale(item.id);
                  const fitScale = size.width / baseSize.width;
                  const rawWidth = Math.ceil(baseSize.width / previewScale);
                  const rawHeight = Math.ceil(baseSize.height / previewScale);

                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${item.name}`}
                      onClick={() => handleItemClick(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleItemClick(item);
                        }
                      }}
                      className="absolute cursor-pointer outline-none"
                      style={{
                        left: position.x,
                        top: position.y,
                        width: size.width,
                        height: size.height,
                      }}
                    >
                      <div
                        className={`pointer-events-none transition-transform ${
                          highlightedItemId === item.id ? "scale-[1.02]" : ""
                        }`}
                        style={{
                          width: size.width,
                          height: size.height,
                        }}
                      >
                        <div
                          style={{
                            width: rawWidth,
                            height: rawHeight,
                            transform: `scale(${previewScale * fitScale})`,
                            transformOrigin: "top left",
                          }}
                        >
                          <div
                            style={
                              previewWidth ? { width: previewWidth } : undefined
                            }
                          >
                            <Component />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <CodeModal
          key={selectedItem.id}
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
