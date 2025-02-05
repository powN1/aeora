import User from "../models/UserModel.ts";
import Message from "../models/MessageModel.ts";
import type { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../errors/InternalServerError.ts";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loggedInUserId = req.user.id;
    console.log("logged user id:", loggedInUserId);
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("firstName surname email profileImg");

    res.status(200).json(filteredUsers);
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const senderId = req.user;
  const { receiverId } = req.body;
  
  console.log(senderId, receiverId)

  const findQuery = {
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  };

  try {
    const messages = await Message.find(findQuery);
    res.status(200).json({ messages });
  } catch (err: any) {}
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const senderId = req.user;
  const { message, receiverId } = req.body;

  try {
    if (!message || message.length === 0) {
      res.status(401).json({ error: "Message can't be empty" });
      return;
    }

    const receiver = await User.findOne({ _id: receiverId });

    if (!receiverId) {
      res.status(401).json({ error: "Provide receiver id" });
      return;
    }

    if (!receiver) {
      res.status(401).json({ error: "Receiver user not found" });
      return;
    }
    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiver._id,
      text: message,
      read: false,
    });

    await newMessage.save();

    res.status(200).json({ success: true, message: "Message sent" });
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};
