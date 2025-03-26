import { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import MessagesList from "../components/MessagesList";
import MessagesInterface from "../components/MessagesInterface";
import Navbar from "../components/Navbar";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify/unstyled";
import uploadImage from "../common/aws";

export const UsersContext = createContext({});

const HomePage: React.FC = () => {
  const { userAuth } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [messagesInterfaceVisible, setMessagesInterfaceVisible] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  
  const [selectedMessage, setSelectedMessage] = useState();

  const messagesEndRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getMessages = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/messages/get-messages`,
        { receiverId: selectedUser._id },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );
      setMessages(response.data.messages);
      setLoadingMessages(false);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (message: string, images: Array<File>) => {
    let tempImagesFileNames = [];

    try {
      if (images && images.length !== 0) {
        const imageUploadLinksResponse = await Promise.all(
          images.map(async (img) => {
            const response = await axios.post(`${BASE_URL}/api/get-upload-url`, {
              headers: { Authorization: `${userAuth.accessToken}` },
            });
            return { img, uploadUrl: response.data.url, imageFileName: response.data.imageFileName };
          })
        );

        await Promise.all(
          imageUploadLinksResponse.map(async ({ img, uploadUrl }) => {
            return uploadImage(img, uploadUrl);
          })
        );

        tempImagesFileNames = imageUploadLinksResponse.map((image) => image.imageFileName);
      }

      console.log('sending msg with', message, tempImagesFileNames)
      const response = await axios.post(
        `${BASE_URL}/api/messages/send-message`,
        { message, tempImagesFileNames, receiverId: selectedUser._id },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );
      if (response) {
        console.log("send message response", response);
        setMessages((prevMessages) => [...prevMessages, response.data.newMessage]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sending a message failed");
      throw err;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/messages/delete-message`,
        { messageId, receiverId: selectedUser._id },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );
      if (response) {
        setMessages((prevMessages) => prevMessages.filter((message) => message._id !== messageId));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Deleting a message failed");
      throw err;
    }
  };
  const readMessage = async (selectedUserId: string) => {
    console.log("id", selectedUserId);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/messages/read-message`,
        { receiverId: selectedUserId },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );
      if (response) {
        console.log(users);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUserId ? { ...user, lastMessage: { ...user.lastMessage, read: true } } : user
          )
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reading a message failed");
      throw err;
    }
  };

  const subscribeToMessages = () => {
    if (Object.keys(selectedUser).length === 0) return;
    const socket = userAuth?.socket;

    if (socket) {
      socket.on("newMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      socket.on("messageDeleted", (deletedMessageId) => {
        setMessages((prevMessages) => prevMessages.filter(message => message._id !== deletedMessageId));
      });
    }
  };

  const unsubscribeFromMessages = () => {
    if (Object.keys(selectedUser).length === 0) return;
    const socket = userAuth?.socket;

    if (socket) {
      socket.off("newMessage");
      socket.off("messageDeleted");
    }
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/messages/get-all-users`, {
          headers: { Authorization: `${userAuth.accessToken}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    getUsers();
  }, [userAuth, messages]);

  useEffect(() => {
    if (Object.keys(selectedUser).length !== 0) getMessages();
  }, [selectedUser]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [messages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messagesEndRef.current && messages) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <UsersContext.Provider
      value={{
        users,
        setUsers,
        selectedUser,
        setSelectedUser,
        sendMessage,
        deleteMessage,
        readMessage,
        messages,
        selectedMessage,
        setSelectedMessage,
        messagesInterfaceVisible,
        setMessagesInterfaceVisible,
        loadingMessages,
        setLoadingMessages,
        messagesEndRef,
      }}
    >
      <main className="h-screen w-screen max-w-screen flex flex-col lg:flex-row">
        <ToastContainer position="top-center" />
        <Navbar />
        <MessagesList />
        <MessagesInterface />
      </main>
    </UsersContext.Provider>
  );
};

export default HomePage;
