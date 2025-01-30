import express from "express";
import cors from "cors";
import "dotenv/config";
import type { Application, Request } from "express";
import dbConnect from "./config/dbConnect.ts";
import firebaseSetup from "./config/firebaseSetup.ts";
// Routes
import authRouter from "./routes/authRoute.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";

const PORT: string | number = process.env.PORT || 3000;

const app: Application = express();
app.use(cors<Request>());
app.use(express.json());

// Firebase initialize config
firebaseSetup();

// Connect mongoose to the database
dbConnect();

app.use("/api/auth", authRouter);

app.all("*", () => {
  throw new Error('oke')
})

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
