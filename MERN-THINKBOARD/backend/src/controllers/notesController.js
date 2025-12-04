import Note from "../models/Note.js";

export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find(); // Note.find() will give you every single notes
    res.status(200).json(notes);
  } catch (error) {
    console.log("Error in getAllNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createNote = async (req, res) => {
  try {
    // to create a note, user is required to enter the title field and content field
    // we will get the title and content, user entered from req.body
    const { title, content } = req.body;

    // create a Note
    const note = new Note({ title: title, content: content });

    // save it to the database
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.log("Error in creating a note", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    // check if the id is the valid object id first
    // 1) "/" in start and "/" in end is the start and end of the regular expression
    // 2) ^ and $ Anchor: Matches the beginning and endiing of the string. Nothing is allowed before and after the ID.
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid note id format" });
    }

    // first pass the "id" such that we know which note we are updating. Then the fields that we would like to update.
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true } // this will return the new note with the updated fields.
    );

    // valid format but the note doesn't exist in the database
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    console.log("Error in updateNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res
        .status(404)
        .json({ message: "Note to be deleted not found :(" });
    }
    res.status(200).json({ message: "Note has been deleted successfully!" });
  } catch (error) {
    console.log("Error in deleting a note", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
