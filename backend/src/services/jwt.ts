import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../errors/AuthenticationError";
import User from "../models/UserModel.ts";

export const generateJWTAccessToken = (userId: ObjectId) => {
  // Check if jwt secret access key exists in .env file
  if (!process.env.JWT_SECRET_ACCESS_KEY) {
    throw new Error("JWT_SECRET_ACCESS_KEY is not defined in environment variables");
  }

  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_ACCESS_KEY);

  return accessToken;
};

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader;

    if (!token) {
      res.status(401).json({ error: "No access token" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY);

    if (!decoded) {
      res.status(401).json({ success: false, message: "Unauthorized - Invalid Token" });
      return;
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.userId = decoded.id;
    next();
  } catch (err: any) {
    next(new AuthenticationError());
  }
};
