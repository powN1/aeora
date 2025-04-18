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

    const enrichedUsers = [];

    for (const user of filteredUsers) {
      const findQuery = {
        $or: [
          { senderId: loggedInUserId, receiverId: user._id },
          { senderId: user._id, receiverId: loggedInUserId },
        ],
      };

      const lastMessageWithUser = await Message.findOne(findQuery).populate("replyingTo").sort({ createdAt: -1 });
      // Convert user to plain JS object
      const userObj = user.toObject();

      if (lastMessageWithUser) {
        userObj.lastMessage = {
          text: lastMessageWithUser.text,
          images: lastMessageWithUser.images,
          read: lastMessageWithUser.read,
          readAt: lastMessageWithUser.readAt,
          sentByUser: lastMessageWithUser.senderId.toString() === loggedInUserId ? true : false,
          sentAt: lastMessageWithUser.createdAt,
        };
      }
      enrichedUsers.push(userObj);
    }

    res.status(200).json(enrichedUsers);
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
    const messages = await Message.find(findQuery).populate([
      {
        path: "replyingTo",
      },
      {
        path: "reactions.userId",
        select: "firstName surname email profileImg",
      },
    ]);
    res.status(200).json({ messages });
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { messageId, receiverId } = req.body;

  try {
    const receiver = await User.findOne({ _id: receiverId });

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
    let message = await Message.findOne(new mongoose.Types.ObjectId(messageId));

    if (!conversation || !message) {
      res.status(404).json({ success: false, message: "Conversation or message not found" });
      return;
    }

    // Remove message from the conversation document
    conversation.messages = conversation.messages.filter((message) => message._id.toString() !== messageId);
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

export const deleteDemoMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const demoAcc = await User.findOne({ email: "newman123@gmail.com" });

    if (!demoAcc) {
      res.status(401).json({ error: "Demo account not found" });
      return;
    }

    const demoAccMessages = await Message.find({ senderId: demoAcc._id });

    if (!demoAccMessages) {
      res.status(401).json({ error: "No demo account messages found" });
      return;
    }

    const lastMessageDate = new Date(1744793258 * 1000); // 15th of April
    const newDemoAccMessages = demoAccMessages.filter((message) => {
      return message.createdAt > lastMessageDate;
    });

    for (const msg of newDemoAccMessages) {
      // Query
      const conversationFindQuery = {
        messages: { $in: [new mongoose.Types.ObjectId(msg._id)] },
      };

      // Find a conversation with this particular message in it
      let conversation = await Conversation.findOne(conversationFindQuery);

      if (!conversation) {
        return;
      }

      // Remove message from the conversation document
      conversation.messages = conversation.messages.filter((message) => message._id.toString() !== msg._id);
      await conversation.save();
      await msg.deleteOne();
    }

    res.status(200).json({ success: true, message: "Demo account messages deleted" });
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const senderId = req.userId;
  const { text, tempImagesFileNames, linkPreviewData, replyingMessageId, receiverId } = req.body;

  try {
    // If there is no message or no photos
    if ((!text || text.length === 0) && (!tempImagesFileNames || tempImagesFileNames.length === 0)) {
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
      text,
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
      const replyingMsg = await Message.findById(replyingMessageId);

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

    // Check if the message is a link
    const urlRegex = /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+(?:\/[^\s]*)?/;
    const match = text.match(urlRegex);

    let linkPreview;

    if (match && match[0])
      if (linkPreviewData) {
        linkPreview = linkPreviewData;
      } else {
        linkPreview = {
          title: "",
          description: "",
          imageUrl: "",
          url: "",
        };
      }
    newMessage.linkPreview = linkPreview;
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
    const receiver = await User.findById(receiverId);

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

    const readMessage = await Message.findOne(findQuery).sort({ createdAt: -1 });

    if (!readMessage) {
      res.status(404).json({ success: false, message: "No message found" });
      return;
    }

    // If message has been read
    if (readMessage.read) {
      res.status(200).json({ success: false, message: "Message already read", readMessage });
      return;
    }

    readMessage.read = true;
    readMessage.readAt = new Date();
    await readMessage.save();

    const receiverSocketId = getReceiverSocketId(receiver._id);
    // If user is online then send the reaction in real time
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("readMessage", readMessage);
    }

    res.status(200).json({ success: true, message: "Message read", readMessage });
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};
