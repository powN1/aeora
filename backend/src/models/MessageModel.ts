import mongoose from "mongoose";
import type { IMessage } from "../config/interface";
import { ObjectId } from "mongodb";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: ObjectId,
      required: true,
    },
    text: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    read: {
      type: Boolean,
    },
    readAt: { type: Date, default: null },
    replyingTo: {
      type: ObjectId,
      ref: "Message",
    },
    reactions: [
      {
        emoji: String,
        userId: { type: ObjectId, ref: "User" },
      },
    ],
    linkPreview: {
      title: String,
      description: String,
      imageUrl: String,
      url: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);
