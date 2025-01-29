import axios from "axios";
import { authWithGoogle, authWithFacebook } from "../common/firebase";
import { toast } from "react-toastify";
import { storeInSession } from "./sessionService";
import { useContext } from "react";
import { UserContext } from "../App";
import { UserRegister, FacebookResponse, FormData } from "../utils/interface";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const register = async (user: UserRegister) => {
  const response = await axios.post(`${BASE_URL}/auth/register`, user);
  if (response.data) {
    storeInSession("user", JSON.stringify(response.data));
  }
  return response.data;
};

const loginGoogleUser = async () => {
  try {
    const googleRes = await authWithGoogle();
    if (!googleRes) {
      throw new Error("Google authentication returned null");
    }
    const googleToken = googleRes.accessToken;

    let formData = { accessToken: googleToken };
    
    const response = await axios.post(`${BASE_URL}/api/auth/login-google`, formData);
    console.log(response.data)
    //
    // if (response.data) {
    //   storeInSession("user", JSON.stringify(response.data));
    // }
    //
  } catch (err: any) {
    return toast.error("Trouble loggin in through google");
  }
};

const loginFacebookUser = async (): Promise<void> => {
  try {
    const facebookRes = await authWithFacebook();
    // console.log(facebookRes);
    if (!facebookRes) {
      throw new Error("Facebook authentication returned null");
    }

    let formData = {
      accessToken: facebookRes.accessToken,
      facebookAccessToken: facebookRes.facebookAccessToken,
    };

    await axios.post(BASE_URL + "/api/auth/login-facebook", formData);

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error logging in:", err.message);
    }

    toast.error("Trouble logging in through Facebook");
  }
};

// const userAuthThroughServer = async (serverRoute: string, formData) => {
//   const response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData);
//   try {
//     storeInSession("user", JSON.stringify(response.data));
//     setUserAuth(response.data);
//   } catch (err) {
//     return toast.error(err);
//   }
// };
//
// export const handleGoogleAuth = async () => {
//   try {
//     const googleRes = await authWithGoogle();
//
//     let serverRoute = "/api/google-auth";
//
//     let formData = { access_token: googleRes.user.accessToken };
//
//     await userAuthThroughServer(serverRoute, formData);
//   } catch (err) {
//     return toast.error("Trouble loggin in through google");
//   }
// };
//
// export const handleFacebookAuth = async () => {
//   try {
//     const facebookRes = await authWithFacebook();
//     let serverRoute = "/api/facebook-auth";
//
//     let formData = {
//       access_token: facebookRes.user.accessToken,
//       facebook_access_token: facebookRes.user.facebookAccessToken,
//     };
//
//     userAuthThroughServer(serverRoute, formData);
//   } catch (err) {
//     return toast.error("Trouble loggin in through facebook");
//   }
// };

export { register, loginGoogleUser, loginFacebookUser };
