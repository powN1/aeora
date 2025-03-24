import { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import MessagesList from "../components/MessagesList";
import MessagesInterface from "../components/MessagesInterface";
import Navbar from "../components/Navbar";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify/unstyled";

export const UsersContext = createContext({});

const HomePage: React.FC = () => {
  const { userAuth } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [messagesInterfaceVisible, setMessagesInterfaceVisible] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);

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

  const sendMessage = async (message: string, image: File) => {
    console.log("got msg", message)
    console.log("and image", image)
    return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/messages/send-message`,
        { message, receiverId: selectedUser._id },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );
      if (response) {
        console.log("send message response", response);
        setMessages([...messages, response.data.newMessage]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sending a message failed");
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
        setMessages([...messages, newMessage]);
      });
    }
  };

  const unsubscribeFromMessages = () => {
    if (Object.keys(selectedUser).length === 0) return;
    const socket = userAuth?.socket;

    if (socket) {
      socket.off("newMessage");
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
        readMessage,
        messages,
        messagesInterfaceVisible,
        setMessagesInterfaceVisible,
        loadingMessages,
        setLoadingMessages,
        messagesEndRef,
      }}
    >
      <main className="h-screen flex flex-col lg:flex-row">
        <ToastContainer position="top-center" />
        <Navbar />
        <MessagesList />
        <MessagesInterface />
      </main>
    </UsersContext.Provider>
  );
};

export default HomePage;
