import { Socket } from "socket.io-client";

export interface UserAuth {
  firstName?: string;
  surname?: string;
  email?: string;
  socket?: Socket;
  id?: string;
  onlineUsers: string[],
  accessToken: string | null;
}

export interface UserRegister {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface FacebookResponse {
  access_token: string;
  facebook_access_token: string;
}

export interface FormData {
  accessToken: string;
  facebookAccessToken: string;
}

export interface MessageCardPreviewProps {
  firstName: string;
  surname: string;
  profileImg: string;
  lastMessage: string;
  read: boolean;
}
