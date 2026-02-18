import express from "express";
import cors from "cors";
import "dotenv/config";
import dbConnect from "./config/dbConnect.ts";
import firebaseSetup from "./config/firebaseSetup.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import type { NextFunction, Response, Request } from "express";
import { app, httpServer } from "./services/socket.ts";
import { fileURLToPath } from "url";
import path from "path";
// Routes
import authRouter from "./routes/authRoute.ts";
import messageRouter from "./routes/messageRoute.ts";
import { generateUploadUrl } from "./utils/awsFunctions.ts";
import { InternalServerError } from "./errors/InternalServerError.ts";

const PORT: string | number = process.env.PORT || 3003;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors<Request>());
app.use(express.json());

// Firebase initialize config
firebaseSetup();

// Connect mongoose to the database
dbConnect();

app.use("/aeora/api/auth", authRouter);
app.use("/aeora/api/messages", messageRouter);

app.post("/aeora/api/get-upload-url", async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  try {
    let url;
    let imageFileName;
    if (userId) {
      const { uploadUrl, imageName } = await generateUploadUrl(userId);
      url = uploadUrl;
      imageFileName = imageName;
    } else {
      const { uploadUrl, imageName } = await generateUploadUrl();
      url = uploadUrl;
      imageFileName = imageName;
    }

    if (url) {
      res.status(200).json({ url, imageFileName });
    }
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
});

// app.all("*", () => {
//   throw new Error("general error");
// });

if (process.env.NODE_ENV === "production") {
  // Accept requests only from patrykkurpiel.com when in production
  app.use(
    cors({
      // origin: "http://patrykkurpiel.com", // Your frontend URL
      origin: "*",
      methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
      allowedHeaders: "Content-Type,Authorization", // Allowed headers
    })
  );

  // Correct path to React build inside Docker
  const clientBuildPath = path.join(__dirname, "../../frontend/dist");
  app.use("/aeora", express.static(clientBuildPath));

  app.get("/aeora/*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  // Accept requests from different ports than backend port (3000) for development
  app.use(cors());
  app.get("/", (req, res) => res.send("Please set to production"));
}

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
