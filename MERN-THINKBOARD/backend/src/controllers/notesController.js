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
    const {title, content} = req.body
    await Note.findByIdAndUpdate(req.params.id, {title, content}) // first pass the "id" such that we know which note we are updating. Then the fields that we would like to update.
  } catch (error) {

  }
};

export const deleteNote = async (req, res) => {
  res.status(200).json({ message: "Note has been deleted" });
};
