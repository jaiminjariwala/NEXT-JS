import { PenSquareIcon, Trash2Icon } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";

const Notecard = ({ note, onDelete }) => {
  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking delete
    e.stopPropagation(); // Stop the click from bubbling to the Link

    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    if (onDelete) {
      onDelete(note._id);
    }
  };

  return (
    <div className="card translate-y-[-8px] transition-all duration-200 shadow-[0_12px_24px_rgba(0,0,0,0.02),0_-3px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06),0_-4px_12px_rgba(0,0,0,0.03)] rounded-2xl p-1 bg-white border-[#ededed] border h-[300px] flex flex-col hover:scale-[1.03]">
      <Link to={`/note/${note._id}`} className="card-body flex-1 flex flex-col min-h-0">

        {/* Title - Fixed */}
        <h3 className="card-title text-base-content text-xl font-semibold mb-2 shrink-0">
          {note.title}
        </h3>

        {/* Content Preview - Scrollable on hover */}
        <div className="flex-1 overflow-hidden hover:overflow-y-auto mb-4 min-h-0">
          <p className="text-gray-600 text-lg font-mediun whitespace-pre-line">{note.content || "No content"}</p>
        </div>

        {/* Footer: Always at bottom - Fixed */}
        <div className="card-actions justify-between items-center pt-3 border-t border-gray-100 shrink-0">
          <span className="text-md text-base-content/60">
            {formatDate(new Date(note.createdAt))}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Delete note"
            >
              <Trash2Icon className="w-4 h-4 text-black group-hover:text-red-800"/>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Notecard;
