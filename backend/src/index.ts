import express from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import dbConnect from "./config/dbConnect.ts";
import firebaseSetup from "./config/firebaseSetup.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import type { Application, Request } from "express";
import { Server } from "socket.io";
// Routes
import authRouter from "./routes/authRoute.ts";
import messageRouter from "./routes/messageRoute.ts";

const PORT: string | number = process.env.PORT || 3000;

const app: Application = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  },
});

app.use(cors<Request>());
app.use(express.json());

// Firebase initialize config
firebaseSetup();

// Connect mongoose to the database
dbConnect();

// Socket
const userSocketMap: any = {};

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
  });
});

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.all("*", () => {
  throw new Error("general error");
});

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
