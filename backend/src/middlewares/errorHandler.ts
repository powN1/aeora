import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { CustomError } from "../utils/CustomError";
import { AuthenticationError } from "../errors/AuthenticationError.ts";
import { DatabaseError } from "../errors/DatabaseError.ts";

export const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json(err.serialize());
  }
  // return res.status(400).json({ success: false, message: "something bad happend"})
};

export default errorHandler;
