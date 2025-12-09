import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { formatDate } from "../lib/utils";

const NoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/notes/${id}`);
        console.log("Fetched note:", response.data);
        setNote(response.data);
        setEditTitle(response.data.title);
        setEditContent(response.data.content);
      } catch (error) {
        console.error("Error fetching note:", error);
        if (error.response?.status === 404) {
          toast.error("Note not found");
          navigate("/");
        } else if (error.response?.status === 429) {
          toast.error("Too many requests. Please wait a moment.");
        } else {
          toast.error("Failed to load note");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Both title and content are required");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5001/api/notes/${id}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });

      setNote(response.data);
      setIsEditing(false);
      toast.success("Note updated successfully! ✨");
    } catch (error) {
      console.error("Error updating note:", error);
      if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      } else {
        toast.error("Failed to update note");
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/notes/${id}`);
      toast.success("Note deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting note:", error);
      if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      } else {
        toast.error("Failed to delete note");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600 py-10">Loading note...</div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600 py-10">Note not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />

      <div className="max-w-2xl mx-auto px-2 py-8">
        {/* Back button */}
        <Link
          to={"/"}
          className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to notes
        </Link>

        <div className="bg-white rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.08),0_-3px_10px_rgba(0,0,0,0.02)] p-8 border-[#ededed]">
          {!isEditing ? (
            // View mode
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-semibold text-black mb-2">
                    {note.title}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Created {formatDate(new Date(note.createdAt))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit note"
                  >
                    <PencilIcon className="w-5 h-5 text-black" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    title="Delete note"
                  >
                    <Trash2Icon className="w-5 h-5 group-hover:text-red-800" />
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            </>
          ) : (
            // Edit mode
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="focus:outline-none focus:ring-0 w-full px-4 py-2 border border-gray-200 rounded-lg transition-all text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows="12"
                  className="focus:outline-none focus:ring-0 w-full px-4 py-3 border border-gray-200 rounded-lg transition-all resize-none text-black"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(note.title);
                    setEditContent(note.content);
                  }}
                  className="items-center px-4 py-2 border border-gray-200 rounded-lg text-[#272343] font-medium hover:text-white hover:bg-[#272343] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#272343] text-white rounded-lg font-medium hover:bg-white hover:text-[#272343] hover:border-[#272343] border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;
