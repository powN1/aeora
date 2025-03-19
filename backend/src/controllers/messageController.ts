import mongoose from "mongoose";
import User from "../models/UserModel.ts";
import Message from "../models/MessageModel.ts";
import type { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../errors/InternalServerError.ts";
import { io, getReceiverSocketId } from "../services/socket.ts";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loggedInUserId = req.user.id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "firstName surname email profileImg"
    );

    for (const user of filteredUsers) {
      const findQuery = {
        $or: [
          { senderId: loggedInUserId, receiverId: user._id },
          { senderId: user._id, receiverId: loggedInUserId },
        ],
      };

      const lastMessageWithUser = await Message.findOne(findQuery).sort({ createdAt: -1 });

      if (lastMessageWithUser) {
        user.lastMessage = {
          text: lastMessageWithUser.text,
          read: lastMessageWithUser.read,
          sentByUser: lastMessageWithUser.senderId.toString() === loggedInUserId? true : false,
        };
      }
    }

    console.log(filteredUsers);

    res.status(200).json(filteredUsers);
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const senderId = req.user;
  const { receiverId } = req.body;

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

    const receiverSocketId = getReceiverSocketId(receiver._id);
    // If user is online then send the msg in real time
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json({ success: true, message: "Message sent", newMessage });
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};
