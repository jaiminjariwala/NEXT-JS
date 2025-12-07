import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

// create express app
const app = express();
const PORT = process.env.PORT || 5001; // we added a fallback value 5001 if process.env.PORT is undefined in any case.

// built-in express middleware that parses incoming JSON request bodies so you can easily acess data using req.body
// it basically reads the incoming request body
app.use(express.json()); // parse JSON bodies
app.use(rateLimiter);
app.use(cors());

// if we get a request that starts with /api/notes then hit "notesRoutes" file
app.use("/api/notes", notesRoutes);

// first connect to DB and then start listening
// because if the database is not connected(if the connection fails), what is the point of starting the app?
connectDB().then(() => {
  // listen on port
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});

// What is an endpoint ?
// An endpoint is a combination of a URL + HTTP method that lets the client interact with a specific resource.
