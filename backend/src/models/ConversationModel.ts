import mongoose from "mongoose";
import type { IConversation } from "../config/interface";
import { ObjectId } from "mongodb";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: ObjectId,
        ref: "Users",
        required: true,
      },
    ],
    messages: [
      {
        type: ObjectId,
        ref: "Messages",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IConversation>("conversation", conversationSchema);
