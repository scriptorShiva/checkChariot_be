import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { ChessGame } from "./ChessGame";
import Cors from "cors";

const app = express();
const server = createServer(app);

// Set up CORS middleware for the Express server
app.use(
  Cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Configure Socket.IO to allow CORS from your frontend URL
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Set up Socket.IO : CLASS APPROACH : for cleaner code
new ChessGame(io);

app.get("/", (req, res) => {
  res.send("Real-Time Chess Server");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
