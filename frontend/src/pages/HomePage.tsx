import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MessagesList from "../components/MessagesList";
import MessagesInterface from "../components/MessagesInterface";
import Navbar from "../components/Navbar";
import axios from "axios";

const HomePage: React.FC = () => {
  const [users, setUsers] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { userAuth } = useAuth();
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
  return (
    <main className="h-screen flex flex-col">
      <Navbar />
      <MessagesList users={users} />
      <MessagesInterface />
    </main>
  );
};

export default HomePage;
