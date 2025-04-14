import { ObjectId } from "mongodb";

type lastMessage = {
  text: string;
  images: string[];
  read: boolean;
  readAt: Date;
  sentByUser: boolean;
  sentAt: Date;
};
export interface IUser {
  _id: string;
  firstName: string;
  surname: string;
  email: string;
  password: string;
  profileImg: string;
  googleAuth: boolean;
  facebookAuth: boolean;
  accessToken?: string;
  lastMessage: lastMessage;
}

type Reaction = {
  emoji: string;
  userId: ObjectId;
};
type LinkPreview = {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
};
export interface IMessage {
  senderId: ObjectId;
  receiverId: ObjectId;
  conversationId: ObjectId;
  text: string;
  images: string[];
  read: boolean;
  readAt: Date;
  replyingTo: ObjectId;
  reactions: Reaction[];
  linkPreview: LinkPreview;
}

export interface IConversation {
  participants: ObjectId[];
  messages: ObjectId[];
}
