import axios from "axios";
import { authWithGoogle, authWithFacebook } from "../common/firebase";
import { toast } from "react-toastify";
import { lookInSession, removeFromSession, storeInSession } from "./sessionService";
import { UserRegister, UserLogin, UserAuth } from "../utils/interface";
import { io, Socket } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const changeProfilePicture = async (
  pictureUrl: string,
  userAuth: UserAuth,
  setUserAuth: (user: UserAuth | null) => void
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/change-profile-picture`,
      { profileImg: pictureUrl },
      { headers: { Authorization: `${userAuth.accessToken}` } }
    );

    if (response.data) {
      // console.log("pic url is:", response.data.profileImg);
      const user: UserAuth = { ...userAuth, profileImg: response.data.profileImg };
      const userInSession = lookInSession("user");
      const userInSessionParsed = JSON.parse(userInSession);
      const userSession = { ...userInSessionParsed, profileImg: response.data.profileImg };
      storeInSession("user", JSON.stringify(userSession));
      setUserAuth(user);
      return user;
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Uploading profile picture failed");
    throw err;
  }
};
const checkAuthorization = (setUserAuth: (user: UserAuth | null) => void) => {
  let userInSession = lookInSession("user");
  if (userInSession) {
    const userData = JSON.parse(userInSession);
    setUserAuth(userData);
    connectSocket(userData, setUserAuth);
  } else {
    setUserAuth({ accessToken: null });
  }
};

const login = async (user: UserLogin, setUserAuth: (user: UserAuth | null) => void) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, user);

    if (response.data) {
      storeInSession("user", JSON.stringify(response.data));
      const userData: UserAuth = response.data;
      setUserAuth(userData);
      connectSocket(userData, setUserAuth);
      return response.data;
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Login failed");
    throw err;
  }
};

const loginGoogleUser = async (setUserAuth: (user: UserAuth | null) => void) => {
  try {
    const googleRes = await authWithGoogle();
    if (!googleRes) {
      throw new Error("Google authentication returned null");
    }
    const googleToken = googleRes.accessToken;

    let formData = { accessToken: googleToken };

    const response = await axios.post(`${BASE_URL}/api/auth/login-google`, formData);
    if (response.data) {
      storeInSession("user", JSON.stringify(response.data));
      const userData: UserAuth = response.data;
      setUserAuth(userData);
      connectSocket(userData, setUserAuth);
      return response.data;
    }
  } catch (err: any) {
    toast.error(err.response?.data?.error || "Trouble logging in with google");
    throw err;
  }
};

const loginFacebookUser = async (setUserAuth: (user: UserAuth | null) => void) => {
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

    const response = await axios.post(BASE_URL + "/api/auth/login-facebook", formData);
    if (response.data) {
      storeInSession("user", JSON.stringify(response.data));
      const userData: UserAuth = response.data;
      setUserAuth(userData);
      connectSocket(userData, setUserAuth);
      return response.data;
    }
  } catch (err: any) {
    toast.error(err.response?.data?.error || "Trouble logging in with facebook");
    throw err;
  }
};

const logout = async (userAuth: UserAuth, setUserAuth: (user: UserAuth | null) => void) => {
  removeFromSession("user");
  disconnectSocket(userAuth, setUserAuth);
  setUserAuth({ accessToken: null });
};

const register = async (user: UserRegister, setUserAuth: (user: UserAuth | null) => void) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, user);

    if (response.data) {
      storeInSession("user", JSON.stringify(response.data));
      const userData: UserAuth = response.data;
      setUserAuth(userData);
      connectSocket(userData, setUserAuth);
      return response.data;
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Registration failed");
    throw err;
  }
};

const connectSocket = (userData: UserAuth, setUserAuth: (user: UserAuth | null) => void) => {
  if (userData?.socket) return;

  const socket = io(import.meta.env.VITE_SERVER_DOMAIN, {
    path: "/aeora/socket",
    query: {
      userId: userData.id,
    },
  });

  // Set socket
  setUserAuth((prevState: UserAuth) => ({
    ...prevState,
    socket,
  }));

  // Set online users
  socket.on("getOnlineUsers", (userIds) => {
    setUserAuth((prevState: UserAuth) => ({
      ...prevState,
      onlineUsers: userIds,
    }));
  });
};

const disconnectSocket = (userAuth: UserAuth, setUserAuth: (user: UserAuth | null) => void) => {
  // console.log(userAuth.socket);
  if (userAuth.socket?.connected) userAuth.socket.disconnect();
  setUserAuth((prevState: UserAuth) => {
    const { socket, ...updatedState } = prevState;
    return updatedState;
  });
};
export { changeProfilePicture, checkAuthorization, login, loginGoogleUser, loginFacebookUser, logout, register };
