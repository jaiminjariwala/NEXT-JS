import express from "express";
import notesRoutes from "./routes/notesRoutes.js"

// create express app
const app = express();

// if we get a request that starts with /api/notes then hit "notesRoutes" file
app.use("/api/notes", notesRoutes)

// listen on port
app.listen(5001, () => {
  console.log("Server started on PORT: 5001");
});

// What is an endpoint ?
// An endpoint is a combination of a URL + HTTP method that lets the client interact with a specific resource.
