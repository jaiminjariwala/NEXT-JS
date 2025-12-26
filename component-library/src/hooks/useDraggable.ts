import { useState, useRef, useCallback, useEffect } from 'react';

interface UseDraggableOptions {
  initialPosition?: { x: number; y: number };
  onDragEnd?: (position: { x: number; y: number }) => void;
  shouldPreventDrag?: (target: HTMLElement) => boolean;
  centered?: boolean;
}

interface UseDraggableReturn {
  elementRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  position: { x: number; y: number };
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  resetPosition: () => void;
  isCentered: boolean;
}

export const useDraggable = ({
  initialPosition = { x: 0, y: 0 },
  onDragEnd,
  shouldPreventDrag,
  centered = true,
}: UseDraggableOptions = {}): UseDraggableReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [isCentered, setIsCentered] = useState(centered);

  const elementRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });

  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches?.[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  };

  const handleDragStart = useCallback(
    (e: MouseEvent | TouchEvent, coords: { x: number; y: number }) => {
      const target = e.target as HTMLElement;
      
      // Check if we should prevent drag
      if (shouldPreventDrag && shouldPreventDrag(target)) {
        return;
      }

      // For touch events, check if the target or any parent has scrollable content
      if ('touches' in e) {
        let element: HTMLElement | null = target;
        while (element && element !== elementRef.current) {
          const hasOverflow = 
            element.scrollHeight > element.clientHeight || 
            element.scrollWidth > element.clientWidth;
          
          const overflowY = window.getComputedStyle(element).overflowY;
          const overflowX = window.getComputedStyle(element).overflowX;
          
          const isScrollable = 
            hasOverflow && 
            (overflowY === 'auto' || overflowY === 'scroll' || 
             overflowX === 'auto' || overflowX === 'scroll');
          
          if (isScrollable) {
            // This is a scrollable area, don't prevent default to allow scrolling
            return;
          }
          
          element = element.parentElement;
        }
      }

      e.preventDefault();
      e.stopPropagation();

      if (!elementRef.current) return;

      isDraggingRef.current = true;
      setIsDragging(true);
      hasMovedRef.current = false;

      // If centered, calculate actual pixel position
      let actualX = position.x;
      let actualY = position.y;

      if (isCentered) {
        const rect = elementRef.current.getBoundingClientRect();
        actualX = rect.left;
        actualY = rect.top;
        setIsCentered(false);
      }

      dragStartRef.current = {
        x: coords.x,
        y: coords.y,
        elementX: actualX,
        elementY: actualY,
      };

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    },
    [position.x, position.y, shouldPreventDrag, isCentered]
  );

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !elementRef.current) return;

    e.preventDefault();

    const coords = getEventCoordinates(e);
    const deltaX = coords.x - dragStartRef.current.x;
    const deltaY = coords.y - dragStartRef.current.y;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMovedRef.current = true;
    }

    // Calculate new position
    const newX = dragStartRef.current.elementX + deltaX;
    const newY = dragStartRef.current.elementY + deltaY;
    
    // Apply directly to element position
    elementRef.current.style.left = `${newX}px`;
    elementRef.current.style.top = `${newY}px`;
    elementRef.current.style.transform = 'none';
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    if (!elementRef.current) return;

    const moved = hasMovedRef.current;

    if (moved) {
      // Get final position from element
      const finalX = parseInt(elementRef.current.style.left) || 0;
      const finalY = parseInt(elementRef.current.style.top) || 0;
      const finalPosition = { x: finalX, y: finalY };
      
      setPosition(finalPosition);
      onDragEnd?.(finalPosition);
    }

    hasMovedRef.current = false;
  }, [onDragEnd]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const coords = getEventCoordinates(e.nativeEvent);
      handleDragStart(e.nativeEvent, coords);
    },
    [handleDragStart]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const coords = getEventCoordinates(e.nativeEvent);
      handleDragStart(e.nativeEvent, coords);
    },
    [handleDragStart]
  );

  const resetPosition = useCallback(() => {
    setPosition(initialPosition);
    setIsCentered(centered);
    if (elementRef.current) {
      elementRef.current.style.left = '';
      elementRef.current.style.top = '';
      elementRef.current.style.transform = '';
    }
  }, [initialPosition, centered]);

  // Set up global event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e);
    const handleGlobalMouseUp = () => handleDragEnd();
    const handleGlobalTouchMove = (e: TouchEvent) => handleMove(e);
    const handleGlobalTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [handleMove, handleDragEnd]);

  return {
    elementRef,
    isDragging,
    position,
    handleMouseDown,
    handleTouchStart,
    resetPosition,
    isCentered,
  };
};
