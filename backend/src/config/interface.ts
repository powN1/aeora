export interface IUser {
    firstName: string,
    surname: string,
    email: string,
    password: string
    profileImg: string,
    googleAuth: boolean,
    facebookAuth: boolean,
    accessToken?: string,
  }
