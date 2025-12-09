import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeftIcon } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import Navbar from "../components/Navbar";

const CreatePage = () => {
  // create states to keep track of inputs user puts in
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false); // once user submit form, this will equal to true
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // .trim() function removes the extra whitespace from both ends of a string.
    // This prevents users from "creating" a note that has a title like "       " (just spaces) or completely empty, which would otherwise create a broken/useless note.
    if (!title.trim() || !content.trim()) {
      toast.error("Both title and content are required 😅");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/notes", {
        title: title.trim(),
        content: content.trim(),
      });

      console.log("Note created:", response.data);
      toast.success("Note created successfully! 🎉");

      // Navigate back to homepage after successful creation
      navigate("/");
    } catch (error) {
      console.error("Error creating note:", error);

      if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      } else {
        toast.error("Failed to create note. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Link that takes back to homepage */}
          <Link
            to={"/"}
            className="inline-flex items-center gap-2 mb-4 text-gray-700 hover:text-black transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to notes
          </Link>

          <div className="bg-white rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.08),0_-3px_10px_rgba(0,0,0,0.02)] p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Create new note
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Title..."
                  className="focus:outline-none focus:ring-0 w-full px-4 py-2 border border-gray-200 rounded-lg transition-all text-black"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <textarea
                  placeholder="Content..."
                  className="focus:outline-none focus:ring-0 w-full px-4 py-3 border border-gray-200 rounded-lg transition-all resize-none text-black"
                  rows="10"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                ></textarea>
              </div>

              <div className="flex justify-end items-center gap-3">
                <Link
                  to={"/"}
                  className="items-center px-4 py-2 border border-gray-200 rounded-lg text-[#272343] font-medium hover:text-white hover:bg-[#272343] transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#272343] text-white rounded-lg font-medium hover:bg-white hover:text-[#272343] hover:border-[#272343] border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
