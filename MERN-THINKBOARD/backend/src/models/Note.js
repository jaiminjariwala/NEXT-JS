// NOTE: For this particular folder files, don't add "s" in filename for example "Note.js" and not "Notes.js". Also file name should start with capital letter.

import mongoose from "mongoose";

// Step 1 :- create a schema
// Step 2 :- create a model based off of that schema

// create schema
const noteSchema = new mongoose.Schema(
  {
    // every single note will have a title of type string and a content i.e description.
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // mongoDB will by default give you "createdAt" and "updatedAt" fields.
);

// create a model based off the schema created above
const Note = mongoose.model("Note", noteSchema);

export default Note;
