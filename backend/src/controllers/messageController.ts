import User from "../models/UserModel.ts";
import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../errors/AuthenticationError.ts";
import { InternalServerError } from "../errors/InternalServerError.ts";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loggedInUserId = req.user.id;
    console.log('logged user id:', loggedInUserId);
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
  } catch (err: any) {}
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
  } catch (err: any) {}
};
