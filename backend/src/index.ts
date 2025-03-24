import express from "express";
import cors from "cors";
import "dotenv/config";
import dbConnect from "./config/dbConnect.ts";
import firebaseSetup from "./config/firebaseSetup.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import type { NextFunction, Response, Request } from "express";
import { io, app, httpServer } from "./services/socket.ts";
// Routes
import authRouter from "./routes/authRoute.ts";
import messageRouter from "./routes/messageRoute.ts";
import { generateUploadUrl } from "./utils/awsFunctions.ts";
import { InternalServerError } from "./errors/InternalServerError.ts";

const PORT: string | number = process.env.PORT || 3000;

app.use(cors<Request>());
app.use(express.json());

// Firebase initialize config
firebaseSetup();

// Connect mongoose to the database
dbConnect();

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.post("/api/get-upload-url", async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  try {
    let url;
    if (userId) url = await generateUploadUrl(userId);
    else url = await generateUploadUrl();

    if (url) {
      res.status(200).json({ uploadUrl: url });
    }
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
});

app.all("*", () => {
  throw new Error("general error");
});

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
