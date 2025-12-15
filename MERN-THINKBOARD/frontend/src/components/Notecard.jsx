import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { formatDate } from "../lib/utils";
import wastebasketIcon1 from "../assets/icons/wastebasket-1.svg";
import wastebasketIcon3 from "../assets/icons/wastebasket-3.svg"

const Notecard = ({ note, onDelete, onPositionUpdate }) => {
  const [position, setPosition] = useState({ 
    x: note.position?.x || 0, 
    y: note.position?.y || 0 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const cardRef = useRef(null);     // reference to the actual HTML element (Note card)
  const navigate = useNavigate();
  
  // Drag state refs
  const isDraggingRef = useRef(false);  // fast-access boolean for "are we dragging?"
  const hasMovedRef = useRef(false);    // did the mouse/finger actually move? (to distinguish click from drag)
  const dragStartRef = useRef({ x: 0, y: 0, cardX: 0, cardY: 0 });    // remembers where drag started
  
  // Touch/long press refs
  const longPressTimerRef = useRef(null);   // stores the timer for detecting long press
  const touchStartTimeRef = useRef(0);    // when the touch started (to calculate duration)
  const canDragRef = useRef(false);

  // Get coordinates from mouse or touch event
  const getEventCoordinates = (e) => {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  // Start drag (both mouse and touch)
  const handleDragStart = useCallback((e, coords) => {
    // Don't start dragging if clicking on buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    
    dragStartRef.current = {
      x: coords.x,
      y: coords.y,
      cardX: position.x,
      cardY: position.y
    };

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [position.x, position.y]);

  // Mouse down handler
  const handleMouseDown = useCallback((e) => {
    const coords = getEventCoordinates(e);
    handleDragStart(e, coords);
  }, [handleDragStart]);

  // Touch start handler with long press
  const handleTouchStart = useCallback((e) => {
    // Don't start if clicking on buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }

    const coords = getEventCoordinates(e);
    touchStartTimeRef.current = Date.now();
    canDragRef.current = false;
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      canDragRef.current = true;
      
      // Vibrate on mobile if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      handleDragStart(e, coords);
    }, 200); // 200ms hold time
  }, [handleDragStart]);

  // Move handler (both mouse and touch)
  const handleMove = useCallback((e) => {
    if (!isDraggingRef.current || !cardRef.current) return;

    e.preventDefault();
    
    const coords = getEventCoordinates(e);
    const deltaX = coords.x - dragStartRef.current.x;
    const deltaY = coords.y - dragStartRef.current.y;
    
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMovedRef.current = true;
    }

    const newX = dragStartRef.current.cardX + deltaX;
    const newY = dragStartRef.current.cardY + deltaY;

    cardRef.current.style.left = `${newX}px`;
    cardRef.current.style.top = `${newY}px`;
  }, []);

  // End drag handler (both mouse and touch)
  const handleDragEnd = useCallback(() => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isDraggingRef.current) {
      // If we didn't drag, check if it was a quick tap/click
      const touchDuration = Date.now() - touchStartTimeRef.current;
      if (touchDuration < 200 && !hasMovedRef.current) {
        navigate(`/note/${note._id}`);
      }
      canDragRef.current = false;
      setIsLongPressing(false);
      return;
    }

    isDraggingRef.current = false;
    setIsDragging(false);
    setIsLongPressing(false);
    canDragRef.current = false;
    
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    if (!cardRef.current) return;

    const moved = hasMovedRef.current;
    
    if (moved) {
      const finalX = parseInt(cardRef.current.style.left) || position.x;
      const finalY = parseInt(cardRef.current.style.top) || position.y;
      
      const newPosition = { x: finalX, y: finalY };
      setPosition(newPosition);
      
      if (onPositionUpdate) {
        onPositionUpdate(note._id, newPosition);
      }
    } else {
      navigate(`/note/${note._id}`);
    }
  }, [navigate, note._id, onPositionUpdate, position.x, position.y]);

  // Touch cancel handler
  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (isDraggingRef.current) {
      handleDragEnd();
    }
    
    setIsLongPressing(false);
    canDragRef.current = false;
  }, [handleDragEnd]);

  // Set up global listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMove(e);
    const handleGlobalMouseUp = () => handleDragEnd();
    const handleGlobalTouchMove = (e) => {
      if (canDragRef.current) {
        handleMove(e);
      }
    };
    const handleGlobalTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleMove, handleDragEnd, handleTouchCancel]);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    if (onDelete) {
      onDelete(note._id);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      className={`card shadow-[0_12px_24px_rgba(0,0,0,0.02),0_-3px_10px_rgba(0,0,0,0.02)] rounded-2xl p-1 bg-white border-[#ededed] border flex flex-col
        w-[350px] h-[300px] 
        sm:w-[350px] sm:h-[300px]
        ${isLongPressing ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        ${
          isDragging 
            ? 'shadow-[0_20px_40px_rgba(0,0,0,0.12)] z-50 scale-105' 
            : 'hover:shadow-[0_16px_32px_rgba(0,0,0,0.06),0_-4px_12px_rgba(0,0,0,0.03)] md:hover:scale-[1.03] transition-all duration-200'
        }`}
    >
      <div className="card-body flex-1 flex flex-col min-h-0 p-4">
        {/* Title - Fixed */}
        <h3 className="text-black card-title text-lg sm:text-xl font-semibold mb-2 shrink-0 line-clamp-2">
          {note.title}
        </h3>

        {/* Content Preview - Scrollable on hover */}
        <div className="flex-1 overflow-hidden hover:overflow-y-auto mb-4 min-h-0">
          <p className="text-gray-600 text-base sm:text-lg font-medium whitespace-pre-line line-clamp-6">
            {note.content || "No content"}
          </p>
        </div>

        {/* Footer: Always at bottom - Fixed */}
        <div className="card-actions justify-between items-center pt-3 border-t border-gray-100 shrink-0">
          <span className="text-md sm:text-md text-[#000000]">
            {formatDate(new Date(note.createdAt))}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="rounded-lg transition-all group"
              title="Delete note"
            >
              <img 
                src={wastebasketIcon1} 
                alt="Delete" 
                className="cursor-pointer w-10 h-10 block group-hover:hidden"
              />
              <img 
                src={wastebasketIcon3} 
                alt="Delete" 
                className="cursor-pointer w-10 h-10 hidden group-hover:block"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notecard;
