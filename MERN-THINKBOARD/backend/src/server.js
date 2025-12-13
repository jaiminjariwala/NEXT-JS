import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

// create express app
const app = express();
const PORT = process.env.PORT || 5001; // we added a fallback value 5001 if process.env.PORT is undefined in any case.
const __dirname = path.resolve(); // saying... we are under the backend

// middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: "http://localhost:5173",
    })
  );
}
// built-in express middleware that parses incoming JSON request bodies so you can easily acess data using req.body
// it basically reads the incoming request body
app.use(express.json()); // parse JSON bodies
app.use(rateLimiter);

// if we get a request that starts with /api/notes then hit "notesRoutes" file
app.use("/api/notes", notesRoutes);




// if we are in production
if (process.env.NODE_ENV === "production") {
  // using a different middleware that comes from express
  app.use(express.static(path.join(__dirname, "../frontend/dist"))); // this basically says that serve our optimized react application as a static application. Go one step up the backend, go under the frontend and find the "dist" folder and serve them.

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  }); // if we get a "get" request other than "/api/notes" mentioned above, we would like to serve our react application
}




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
