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

export interface IMessage {
  senderId: string,
  receiverId: string
  text: string
  image: string
}
