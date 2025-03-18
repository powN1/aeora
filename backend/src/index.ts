import express from "express";
import cors from "cors";
import "dotenv/config";
import dbConnect from "./config/dbConnect.ts";
import firebaseSetup from "./config/firebaseSetup.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import type { Request } from "express";
import { io, app, httpServer } from "./services/socket.ts";
// Routes
import authRouter from "./routes/authRoute.ts";
import messageRouter from "./routes/messageRoute.ts";

const PORT: string | number = process.env.PORT || 3000;

app.use(cors<Request>());
app.use(express.json());

// Firebase initialize config
firebaseSetup();

// Connect mongoose to the database
dbConnect();

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.all("*", () => {
  throw new Error("general error");
});

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
