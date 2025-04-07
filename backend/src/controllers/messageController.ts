import mongoose from "mongoose";
import User from "../models/UserModel.ts";
import Message from "../models/MessageModel.ts";
import Conversation from "../models/ConversationModel.ts";
import type { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../errors/InternalServerError.ts";
import { io, getReceiverSocketId } from "../services/socket.ts";
import { nanoid } from "nanoid";
import s3 from "../utils/awsFunctions.ts";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loggedInUserId = req.userId;
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

      const lastMessageWithUser = await Message.findOne(findQuery).populate("replyingTo").sort({ createdAt: -1 });

      if (lastMessageWithUser) {
        user.lastMessage = {
          text: lastMessageWithUser.text,
          read: lastMessageWithUser.read,
          sentByUser: lastMessageWithUser.senderId.toString() === loggedInUserId ? true : false,
        };
      }
    }

    res.status(200).json(filteredUsers);
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const senderId = req.userId;
  const { receiverId } = req.body;

  const findQuery = {
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  };

  try {
    const messages = await Message.find(findQuery).populate("replyingTo");
    res.status(200).json({ messages });
  } catch (err: any) {}
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { messageId, receiverId } = req.body;

  try {
    const receiver = await User.findOne({ _id: receiverId });

    console.log("receiver", receiver);
    if (!receiver) {
      res.status(401).json({ error: "Receiver user not found" });
      return;
    }

    // If there is no messageId
    if (!messageId) {
      res.status(401).json({ error: "Message id required" });
      return;
    }

    const conversationFindQuery = {
      messages: { $in: [new mongoose.Types.ObjectId(messageId)] },
    };

    // Find a conversation with this particular message in it
    let conversation = await Conversation.findOne(conversationFindQuery);
    console.log("convo", conversation);
    let message = await Message.findOne(new mongoose.Types.ObjectId(messageId));
    console.log("message", message);

    if (!conversation || !message) {
      res.status(404).json({ success: false, message: "Conversation or message not found" });
      return;
    }

    // Remove message from the conversation document
    conversation.messages.filter((message) => message._id !== messageId);
    await conversation.save();
    await message.deleteOne();

    const receiverSocketId = getReceiverSocketId(receiver._id);
    // If user is online then send the msg in real time
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    res.status(200).json({ success: true, message: "Message deleted", messageId: message._id });
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const senderId = req.userId;
  const { message, tempImagesFileNames, replyingMessageId, receiverId } = req.body;
  console.log(receiverId);

  try {
    // If there is no message or no photos
    if ((!message || message.length === 0) && (!tempImagesFileNames || tempImagesFileNames.length === 0)) {
      res.status(401).json({ error: "Message or images required" });
      return;
    }

    if (!receiverId) {
      res.status(401).json({ error: "Provide receiver id" });
      return;
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      res.status(401).json({ error: "Receiver user not found" });
      return;
    }

    const conversationFindQuery = {
      participants: { $all: [senderId, receiverId] },
    };

    // Check if a conversation already exists and if yes then get conversationId
    let conversation = await Conversation.findOne(conversationFindQuery);

    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiver._id,
      text: message,
      read: false,
    });

    let conversationId;

    if (conversation) {
      conversationId = conversation._id;
    } else {
      conversation = new Conversation({ participants: [senderId, receiverId], messages: [] });

      conversationId = conversation._id;
    }

    newMessage.conversationId = conversationId;

    if (replyingMessageId) {
      const replyingMsg = await Message.findOne({ _id: replyingMessageId });

      if (!replyingMsg) {
        res.status(401).json({ error: "Replying message not found" });
        return;
      }

      newMessage.replyingTo = replyingMsg._id;
    }

    // Add message to the conversation document
    conversation.messages.push(newMessage._id);

    // Move the images in S3 to the correct folder (from temp to conversation/)
    if (tempImagesFileNames && tempImagesFileNames.length > 0) {
      const finalFileNames = await Promise.all(
        tempImagesFileNames.map(async (tempFileName: string) => {
          const finalFileName = `messages/conversation-${conversationId}/${newMessage._id}-${nanoid()}-${Date.now()}.jpeg`;

          await s3
            .copyObject({
              Bucket: process.env.AWS_BUCKET_NAME,
              CopySource: `${process.env.AWS_BUCKET_NAME}/${tempFileName}`,
              Key: finalFileName,
            })
            .promise();

          s3.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: tempFileName,
          }).promise();

          return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${finalFileName}`;
        })
      );

      // Update the message with the final image URLs
      newMessage.images = finalFileNames;
    }

    await conversation.save();

    const newMsgSaved = await newMessage.save();
    const populatedMsg = await Message.findById(newMsgSaved._id).populate("replyingTo");

    const receiverSocketId = getReceiverSocketId(receiver._id);
    // If user is online then send the msg in real time
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMsg);
    }

    res.status(200).json({ success: true, message: "Message sent", newMessage: populatedMsg });
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const reactToMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const senderId = req.userId;
  const { messageId, emoji, receiverId } = req.body;

  try {
    // If there is no message or no photos
    if (!messageId) {
      res.status(401).json({ error: "Message id required" });
      return;
    }

    if (!emoji) {
      res.status(401).json({ error: "Emoji required" });
      return;
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      res.status(401).json({ error: "Receiver user not found" });
      return;
    }

    const message = await Message.findById(messageId).populate("replyingTo");

    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    const existingReactionIndex = message.reactions.findIndex((r) => {
      return r.userId.toString() === senderId.toString();
    });

    if (existingReactionIndex !== -1) {
      const currentEmoji = message.reactions[existingReactionIndex].emoji;

      if (currentEmoji === emoji) {
        // Remove reaction
        message.reactions.splice(existingReactionIndex, 1);
        // console.log("reactions after removal", message.reactions);
      } else {
        // Update emoji
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions = [...message.reactions, { emoji, userId: senderId }];
    }

    await message.save();

    const receiverSocketId = getReceiverSocketId(receiver._id);
    // If user is online then send the reaction in real time
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", message);
    }

    res.status(200).json({ success: true, message: "Reaction sent", newMessage: message });
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const readMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const senderId = req.userId;
  const { receiverId } = req.body;

  try {
    const receiver = await User.findOne({ _id: receiverId });

    if (!receiverId) {
      res.status(401).json({ error: "Provide receiver id" });
      return;
    }

    if (!receiver) {
      res.status(401).json({ error: "Receiver user not found" });
      return;
    }

    const findQuery = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    };

    const lastMessageWithUser = await Message.findOne(findQuery).sort({ createdAt: -1 });

    if (lastMessageWithUser) {
      lastMessageWithUser.read = true;
      await lastMessageWithUser.save();
    }

    res.status(200).json({ success: true, message: "Message read", lastMessageWithUser });
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};
