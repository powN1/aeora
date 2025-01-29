import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export const generateJWTAccessToken = (userId: ObjectId) => {
  // Check if jwt secret access key exists in .env file
  if (!process.env.JWT_SECRET_ACCESS_KEY) {
    throw new Error("JWT_SECRET_ACCESS_KEY is not defined in environment variables");
  }

  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_ACCESS_KEY);

  return accessToken;
};
