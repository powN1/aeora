import { getAuth } from "firebase-admin/auth";
import User from "../models/UserModel.ts";
import { generateJWTAccessToken } from "../services/jwt.ts";
import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../config/interface.ts";
import { AuthenticationError } from "../errors/AuthenticationError.ts";
import { InternalServerError } from "../errors/InternalServerError.ts";
import { generateUploadUrl, uploadFileToAWSfromUrl } from "../utils/awsFunctions.ts";

// Regex for identifying whether the email and password are correctly formatted
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const formatUserData = (userData: IUser) => {
  return {
    id: userData._id,
    accessToken: userData.accessToken,
    profileImg: userData.profileImg,
    firstName: userData.firstName,
    surname: userData.surname,
  };
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(400).json({ error: "Email not found" });
      return;
    }

    // Check if email was registered with google or facebook
    if (user.googleAuth && !user.facebookAuth) {
      res.status(409).json({
        success: false,
        message: "Account was created using google. Try logging in with google.",
      });
      return;
    } else if (!user.googleAuth && user.facebookAuth) {
      res.status(409).json({
        success: false,
        message: "Account was created using facebook. Try logging in with facebook.",
      });
      return;
    }

    const passwordComparison = await bcrypt.compare(password, user.password);

    if (!passwordComparison) {
      res.status(400).json({
        success: false,
        message: "Password incorrect.",
      });
      return;
    }

    // Generate fresh user token
    user.accessToken = generateJWTAccessToken(user._id);

    res.status(200).json(formatUserData(user));
    return;
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
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
        res.status(409).json({
          error: "This email was signed up without facebook. Please log in with password to access the account.",
        });
        return;
      } else {
        user.accessToken = generateJWTAccessToken(user._id);
        res.status(200).json(formatUserData(user));
        return;
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
        facebookAuth: true,
      });

      const awsImageUrl = await uploadFileToAWSfromUrl(profileImg, user._id);
      user.profileImg = awsImageUrl;

      user = await user.save();
      user.accessToken = generateJWTAccessToken(user._id);
      const formattedUser = formatUserData(user);

      res.status(200).json(formattedUser);
      return;
    }
  } catch (err) {
    next(new InternalServerError());
  }
};

export const loginGoogleUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log("login google");
  let { accessToken } = req.body;

  try {
    const firebaseAuth = await getAuth().verifyIdToken(accessToken);
    let { email, name, picture } = firebaseAuth;

    // picture = picture?.replace("s96-c", "s384-c");
    let user = await User.findOne({ email: email }).select("firstName surname email profileImg googleAuth");

    if (user) {
      //login
      if (!user.googleAuth) {
        res.status(409).json({
          error: "This email was signed up without google. Please log in with password to access the account.",
        });
        return;
      } else {
        // Generate fresh user token
        user.accessToken = generateJWTAccessToken(user._id);
        res.status(200).json(formatUserData(user));
        return;
      }
    } else {
      //signup
      const splitName = name.trim().split(" ");
      const firstName = splitName[0];
      const surname = splitName[1];

      user = new User({
        firstName,
        surname,
        email,
        googleAuth: true,
      });

      if (picture) {
        const awsImageUrl = await uploadFileToAWSfromUrl(picture, user._id);
        user.profileImg = awsImageUrl;
      }

      user = await user.save();
      user.accessToken = generateJWTAccessToken(user._id);
      const formattedUser = formatUserData(user);

      res.status(200).json(formattedUser);
      return;
    }
  } catch (err) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, surname, email, password } = req.body;

  // Error checking
  if (firstName.length < 2) {
    res.status(400).json({ success: false, message: "First name must be at least 2 letters long" });
    return;
  }
  if (surname.length < 3) {
    res.status(400).json({ success: false, message: "Surname must be at least 3 letters long" });
    return;
  }
  if (!email.length) {
    res.status(400).json({ success: false, message: "Enter email" });
    return;
  }
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "Email is invalid" });
    return;
  }
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      success: false,
      message: "Password should be 6-20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
    });
    return;
  }

  try {
    // Use bcrypt to hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      surname,
      email,
      password: hashedPassword,
    });
    
    const savedUser = await user.save();
    user.id = savedUser._id;
    user.accessToken = generateJWTAccessToken(user._id);

    res.status(200).json(formatUserData(savedUser));
    return;
  } catch (err: any) {
    // Check for duplicated emails
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      if (duplicateField === "email") {
        res.status(409).json({ success: false, message: "Email already exists" });
        return;
      }
    }

    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};

export const changeProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.userId;

  const { profileImg } = req.body;

  if (!profileImg) {
    res.status(400).json({ success: false, message: "Picutre has to be provided" });
    return;
  }

  try {
    const user = await User.findById(id);
    if (user) {
      user.profileImg = profileImg;
      await user.save();
      res.status(200).json({ profileImg });
    }
  } catch (err: any) {
    // If any other errors happen throw 500 error
    next(new InternalServerError());
  }
};
