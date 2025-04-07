import { ObjectId } from "mongodb";

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
}

type Reaction = {
  emoji: string;
  userId: ObjectId;
};
export interface IMessage {
  senderId: ObjectId;
  receiverId: ObjectId;
  conversationId: ObjectId;
  text: string;
  images: string[];
  read: boolean;
  replyingTo: ObjectId;
  reactions: Reaction[];
}

export interface IConversation {
  participants: ObjectId[];
  messages: ObjectId[];
}
