import axios from "axios";
import { authWithGoogle, authWithFacebook } from "../common/firebase";
import { toast } from "react-toastify";
import { storeInSession } from "./sessionService";
import { UserRegister, UserLogin, UserAuth } from "../utils/interface";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const login = async (user: UserLogin, setUserAuth: (user: UserAuth | null) => void) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, user);

    if (response.data) {
      storeInSession("user", JSON.stringify(response.data));
      const userData: UserAuth = response.data;
      setUserAuth(userData);
      return response.data;
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Login failed");
    throw err;
  }
};

const register = async (user: UserRegister, setUserAuth: (user: UserAuth | null) => void) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, user);

    if (response.data) {
      storeInSession("user", JSON.stringify(response.data));
      const userData: UserAuth = response.data;
      setUserAuth(userData);
      return response.data;
    }

  } catch (err: any) {
    toast.error(err.response?.data?.message || "Registration failed");
    throw err;
  }
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
    console.log(response.data);
    //
    // if (response.data) {
    //   storeInSession("user", JSON.stringify(response.data));
    // }
    //
  } catch (err: any) {
    toast.error(err.response?.data?.error || "Trouble logging in with google");
    throw err;
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
    toast.error(err.response?.data?.error || "Trouble logging in with facebook");
    throw err;
  }
};

export { login, loginGoogleUser, loginFacebookUser, register };
