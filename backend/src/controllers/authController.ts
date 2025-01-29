import type { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import User from "../models/UserModel.ts";
import { generateJWTAccessToken } from "../services/jwt.ts";
import type { IUser } from "../config/interface.ts";

const formatUserData = (userData: IUser) => {
  return {
    accessToken: userData.accessToken,
    profile_img: userData.profileImg,
    firstName: userData.firstName,
    surname: userData.surname,
  };
};

export const loginFacebookUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let { accessToken, facebookAccessToken } = req.body;

  try {
    const firebaseAuth = await getAuth().verifyIdToken(accessToken);
    let { email, name, picture } = firebaseAuth;

    // picture = picture?.replace("s96-c", "s384-c");
    let user = await User.findOne({ email: email }).select("firstName surname email profileImg facebookAuth");

    if (user) {
      //login
      if (!user.facebookAuth) {
        res.status(403).json({
          error: "This email was signed up without facebook. Please log in with password to access the account.",
        });
      }
    } else {
      //signup
      const splitName = name.trim().split(" ");
      const firstName = splitName[0];
      const surname = splitName[1];

      // Make the request to the Facebook Graph API
      const url = `https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${facebookAccessToken}`;
      const facebookPictureRequest = await fetch(url);
      const facebookResponse = await facebookPictureRequest.json();
      const profileImg = facebookResponse.picture.data.url;

      user = new User({
        firstName,
        surname,
        email,
        profileImg,
        facebookAuth: true,
      });

      user = await user.save();
      user.accessToken = generateJWTAccessToken(user._id);
      const formattedUser = formatUserData(user);

      res.status(200).json(formattedUser);
    }
  } catch (err) {
    next(err);
  }
};

export const loginGoogleUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let { accessToken } = req.body;

  try {
    const firebaseAuth = await getAuth().verifyIdToken(accessToken);
    let { email, name, picture } = firebaseAuth;

    // picture = picture?.replace("s96-c", "s384-c");
    let user = await User.findOne({ email: email }).select("firstName surname email profileImg googleAuth");

    if (user) {
      //login
      if (!user.googleAuth) {
        res.status(403).json({
          error: "This email was signed up without google. Please log in with password to access the account.",
        });
      }
    } else {
      //signup
      const splitName = name.trim().split(" ");
      const firstName = splitName[0];
      const surname = splitName[1];

      // Make the request to the Facebook Graph API
      const profileImg = picture;

      user = new User({
        firstName,
        surname,
        email,
        profileImg,
        googleAuth: true,
      });

      user = await user.save();
      user.accessToken = generateJWTAccessToken(user._id);
      const formattedUser = formatUserData(user);

      res.status(200).json(formattedUser);
    }
  } catch (err) {
    next(err);
  }
};
