import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import axios from "axios";
import toast from "react-hot-toast";
import Notecard from "../components/Notecard";

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  // fetch the notes
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true); // as soon as we visit homepage, we will try to fetch the notes

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
      setNotes(res.data);
      setIsRateLimited(false); // once we're able to get the data, that means we're not rate limited.
    } catch (error) {
      // or we get some errors
      console.log("Error fetching notes:", error);

      // if we are rate limited
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
      // Remove the deleted note from state
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

  return (
    <div className="min-h-screen">
      <Navbar />
      {isRateLimited && <RateLimitedUI />}
      {/* show <RateLimitedUI /> component only when isRateLimited is true */}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {/* Loading state */}
        {loading && !isRateLimited && (
          <div className="text-center text-black py-10">Loading notes...</div>
        )}

        {/* Notes exist - show them */}
        {!loading && !isRateLimited && notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => {
              return (
                <Notecard key={note._id} note={note} onDelete={handleDelete} />
              );
            })}
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
