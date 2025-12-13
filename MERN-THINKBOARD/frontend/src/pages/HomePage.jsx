import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import axios from "axios";
import toast from "react-hot-toast";
import Notecard from "../components/Notecard";

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("loading=", loading);
  console.log("notes=", notes);
  console.log("isRateLimited=", isRateLimited);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/notes");
      console.log("Fetched notes:", res.data);
      
      // Add positions to notes if they don't have them
      const notesWithPositions = res.data.map((note, index) => ({
        ...note,
        position: note.position || {
          x: 50 + (index % 3) * 400,
          y: 50 + Math.floor(index / 3) * 350,
        },
      }));
      
      setNotes(notesWithPositions);
      setIsRateLimited(false);
    } catch (error) {
      console.log("Error fetching notes:", error);

      if (error.response?.status === 429) {
        setIsRateLimited(true);
      } else {
        toast.error("Failed to load notes :(");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await axios.delete(`http://localhost:5001/api/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      } else {
        toast.error("Failed to delete note");
      }
    }
  };

  const handlePositionUpdate = (noteId, newPosition) => {
    setNotes(prevNotes =>
      prevNotes.map((note) =>
        note._id === noteId ? { ...note, position: newPosition } : note
      )
    );
  };

  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      {isRateLimited && <RateLimitedUI />}

      <div className="w-full">
        {/* Loading state */}
        {loading && !isRateLimited && (
          <div className="text-center text-black py-10">Loading notes...</div>
        )}

        {/* Notes exist - show them in canvas */}
        {!loading && !isRateLimited && notes.length > 0 && (
          <div 
            className="relative w-full h-[calc(100vh-80px)] overflow-hidden"
            style={{
              contain: 'layout style paint',
            }}
          >
            {notes.map((note) => (
              <Notecard
                key={note._id}
                note={note}
                onDelete={handleDelete}
                onPositionUpdate={handlePositionUpdate}
              />
            ))}
          </div>
        )}

        {/* No notes - show empty state */}
        {!loading && !isRateLimited && notes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400 mb-4">No notes yet</p>
            <p className="text-gray-500">
              Create your first note to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
