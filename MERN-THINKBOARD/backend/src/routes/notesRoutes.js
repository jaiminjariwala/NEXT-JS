import express from "express";
import { getAllNotes, createNote, updateNote, deleteNote } from "../controllers/notesController.js";

// create a router
const router = express.Router();

// listen for the /api/notes route. Once we get a "get" function, we will run a function which will take the request and response
// as you hit this url "localhost:5001/api/notes" you are basically requesting for that page, and server responses with res.send("you got 5 notes")
router.get("/", getAllNotes);
router.post("/", createNote); // if user wants to create a node, user will send a post request
router.put("/:id", updateNote); // to update a note, we will get the "id" to know that which note are we trying to update.
router.delete("/:id", deleteNote);  // to delete a note, we will again get the id to know that which note are we trying to delete.

export default router;
