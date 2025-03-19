import mongoose from "mongoose";
import type { IUser } from "../config/interface";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: [2, "First name must be 2 letters long"],
      maxlength: 25,
    },
    surname: {
      type: String,
      lowercase: true,
      required: true,
      minlength: [3, "fullname must be 3 letters long"],
      maxlength: 25,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
    profileImg: {
      type: String,
      default: "",
    },
    googleAuth: {
      type: Boolean,
      default: false,
    },
    facebookAuth: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      text: {
        type: String,
        default: false,
      },
      read: {
        type: Boolean,
        default: false,
      },
      sentByUser: {
        type: Boolean,
      }
    },
  },
  {
    timestamps: {
      createdAt: "joinedAt",
    },
  }
);

export default mongoose.model<IUser>("user", userSchema);
