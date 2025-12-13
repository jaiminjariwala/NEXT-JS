import { Trash2Icon } from "lucide-react";

// useRef is like a box that stores a value, but changing it does not refresh the UI, unlike useState
import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { formatDate } from "../lib/utils";

const Notecard = ({
  note,
  onDelete,
  onPositionUpdate,
}) => {
  const [position, setPosition] = useState({ 
    x: note.position?.x || 0, 
    y: note.position?.y || 0 
  });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();
  
  // Drag state refs
  const isDraggingRef = useRef(false);  // tracks if we're dragging (faster than state)
  const hasMovedRef = useRef(false);  // did the mouse actually move, or just click ?
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, cardX: 0, cardY: 0 });  // remembers where the mouse AND card started when we began dragging

  const handleMouseDown = useCallback((e) => {
    // Don't start dragging if clicking on buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }

    e.preventDefault(); // tells the browser "don't do your normal click behavior "
    e.stopPropagation();
    
    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    
    // Store initial positions
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cardX: position.x,
      cardY: position.y
    };

    // Change cursor immediately
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [position.x, position.y]);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !cardRef.current) return;

    e.preventDefault();
    
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;
    
    // Consider it a drag if moved more than 3px
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMovedRef.current = true;
    }

    const newX = dragStartRef.current.cardX + deltaX;
    const newY = dragStartRef.current.cardY + deltaY;

    // Directly update the position via CSS
    cardRef.current.style.left = `${newX}px`;
    cardRef.current.style.top = `${newY}px`;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDragging(false);
    
    // Reset cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    if (!cardRef.current) return;

    const moved = hasMovedRef.current;
    
    if (moved) {
      // Get final position from style
      const finalX = parseInt(cardRef.current.style.left) || position.x;
      const finalY = parseInt(cardRef.current.style.top) || position.y;
      
      const newPosition = { x: finalX, y: finalY };
      setPosition(newPosition);
      
      if (onPositionUpdate) {
        onPositionUpdate(note._id, newPosition);
      }
    } else {
      // Click - navigate to note
      navigate(`/note/${note._id}`);
    }
  }, [navigate, note._id, onPositionUpdate, position.x, position.y]);

  // Set up global listeners
  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

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
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '350px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      className={`card shadow-[0_12px_24px_rgba(0,0,0,0.02),0_-3px_10px_rgba(0,0,0,0.02)] rounded-2xl p-1 bg-white border-[#ededed] border h-[300px] flex flex-col ${
        isDragging 
          ? 'shadow-[0_20px_40px_rgba(0,0,0,0.12)] z-50' 
          : 'translate-y-[-8px] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06),0_-4px_12px_rgba(0,0,0,0.03)] hover:scale-[1.03] transition-all duration-200'
      }`}
    >
      <div className="card-body flex-1 flex flex-col min-h-0 p-4">
        {/* Title - Fixed */}
        <h3 className="text-black card-title text-xl font-semibold mb-2 shrink-0">
          {note.title}
        </h3>

        {/* Content Preview - Scrollable on hover */}
        <div className="flex-1 overflow-hidden hover:overflow-y-auto mb-4 min-h-0">
          <p className="text-gray-600 text-lg font-mediun whitespace-pre-line">
            {note.content || "No content"}
          </p>
        </div>

        {/* Footer: Always at bottom - Fixed */}
        <div className="card-actions justify-between items-center pt-3 border-t border-gray-100 shrink-0">
          <span className="text-md text-[#797979]">
            {formatDate(new Date(note.createdAt))}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Delete note"
            >
              <Trash2Icon className="w-4 h-4 text-black group-hover:text-red-800" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notecard;
