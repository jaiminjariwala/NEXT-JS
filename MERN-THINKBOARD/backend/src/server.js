import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

// create express app
const app = express();
const PORT = process.env.PORT || 5001;  // we added a fallback value 5001 if process.env.PORT is undefined in any case.

connectDB();

// built-in express middleware that parses incoming JSON request bodies so you can easily acess data using req.body
// it basically reads the incoming request body
app.use(express.json()) // parse JSON bodies

// if we get a request that starts with /api/notes then hit "notesRoutes" file
app.use("/api/notes", notesRoutes);

// listen on port
app.listen(PORT, () => {
  console.log("Server started on PORT:", PORT);
});

// What is an endpoint ?
// An endpoint is a combination of a URL + HTTP method that lets the client interact with a specific resource.
