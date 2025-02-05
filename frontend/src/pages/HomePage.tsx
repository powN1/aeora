import { createContext, useEffect, useState } from "react";
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
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (message: string) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/messages/send-message`,
        { message, receiverId: selectedUser._id },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );
      console.log("send message response", response);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sending a message failed");
      throw err;
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
  }, [userAuth]);

  useEffect(() => {
    getMessages();
  }, [selectedUser]);

  return (
    <UsersContext.Provider
      value={{
        users,
        selectedUser,
        setSelectedUser,
        sendMessage,
        messages,
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
