import http from "http";
import express from "express";
import type { Application } from "express";
import { Server } from "socket.io";

const app: Application = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  },
});

// Socket

export function getReceiverSocketId(userId: string) {
  return userSocketMap[userId];
}

// Store online users
type userSocketMapType = {
  [key: string]: string;
};

const userSocketMap: userSocketMapType = {};

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, httpServer };
