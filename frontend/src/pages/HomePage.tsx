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
  const [loadingUsers, setLoadingUsers] = useState(true);

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
      const { messages } = response.data;
      console.log(selectedUser);

      setMessages(response.data.messages);
      setLoadingMessages(false);

      return messages;
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (text: string, images: Array<File>, replyingMessageId: string) => {
    console.log(`sendmsg text: ${text}, images: ${images}, replyMsgId: ${replyingMessageId}`);
    // Check if there are any images in the message
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
        console.log("links for upload", imageUploadLinksResponse);

        await Promise.all(
          imageUploadLinksResponse.map(async ({ img, uploadUrl }) => {
            return uploadImage(img, uploadUrl);
          })
        );

        tempImagesFileNames = imageUploadLinksResponse.map((image) => image.imageFileName);
      }

      // Check if the message is a link
      const urlRegex = /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+(?:\/[^\s]*)?/;
      const match = text.match(urlRegex);

      let linkPreviewData;

      if (match && match[0]) {
        const url = match[0];
        try {
          const response = await axios.post(
            "https://api.linkpreview.net",
            { q: url },
            { headers: { "X-Linkpreview-Api-Key": import.meta.env.VITE_LINK_PREVIEW_API_KEY } }
          );

          const data = response.data;
          if (data) {
            linkPreviewData = {
              title: data.title,
              description: data.description,
              imageUrl: data.image,
              url: url,
            };
          }
        } catch (previewError) {
          console.warn("Link preview fetch failed:", previewError);
        }
      }

      const response = await axios.post(
        `${BASE_URL}/api/messages/send-message`,
        { text, linkPreviewData, tempImagesFileNames, replyingMessageId, receiverId: selectedUser._id },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );

      if (response) {
        setMessages((prevMessages) => [...prevMessages, response.data.newMessage]);
        // Scroll to the bottom of messages
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sending a message failed");
      throw err;
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/messages/react-to-message`,
        { messageId, emoji, receiverId: selectedUser._id },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );

      if (response) {
        // Replace the message in the array
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === response.data.newMessage._id ? response.data.newMessage : msg))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reacting to a message failed");
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
    try {
      const response = await axios.post(
        `${BASE_URL}/api/messages/read-message`,
        { receiverId: selectedUserId },
        {
          headers: { Authorization: `${userAuth.accessToken}` },
        }
      );
      if (response.data.success) {
        const { readMessage } = response.data;
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUserId
              ? {
                  ...user,
                  lastMessage: { ...user.lastMessage, read: true, readAt: readMessage.readAt },
                }
              : user
          )
        );
        setMessages((prevMessages) =>
          prevMessages.map((message) => (message._id === readMessage._id ? { ...readMessage } : message))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reading a message failed");
      throw err;
    }
  };

  const subscribeToMessages = () => {
    const isUserSelected = Object.keys(selectedUser).length !== 0;
    // if (Object.keys(selectedUser).length === 0) return;
    const socket = userAuth?.socket;

    if (socket) {
      socket.on("newMessage", (newMessage) => {
        // console.log("u got a new msg!!!");
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        if (newMessage.senderId === selectedUser._id && !newMessage.read && isUserSelected) {
          // Automatically mark as read if you're in that conversation
          readMessage(selectedUser._id);
        }
      });

      socket.on("readMessage", (readMessage) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUser._id
              ? {
                  ...user,
                  lastMessage: { ...user.lastMessage, read: true, readAt: readMessage.readAt },
                }
              : user
          )
        );
        setMessages((prevMessages) =>
          prevMessages.map((message) => (message._id === readMessage._id ? { ...readMessage } : message))
        );
      });

      socket.on("messageDeleted", (deletedMessageId) => {
        setMessages((prevMessages) => prevMessages.filter((message) => message._id !== deletedMessageId));
      });

      socket.on("messageReaction", (message) => {
        setMessages((prevMessages) => prevMessages.map((msg) => (msg._id === message._id ? message : msg)));
      });
    }
  };

  const unsubscribeFromMessages = () => {
    if (Object.keys(selectedUser).length === 0) return;
    const socket = userAuth?.socket;

    if (socket) {
      socket.off("newMessage");
      socket.off("messageDeleted");
      socket.off("messageReaction");
    }
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/messages/get-all-users`, {
          headers: { Authorization: `${userAuth.accessToken}` },
        });
        setUsers(response.data);
        setLoadingUsers(false);
      } catch (err) {
        console.error(err);
      }
    };
    getUsers();
  }, [userAuth, messages]);

  useEffect(() => {
    const readAndGetMessages = async () => {
      if (Object.keys(selectedUser).length === 0) {
        return;
      }

      const fetchedMessages = await getMessages();
      if (fetchedMessages && fetchedMessages.length > 0) {
        const lastMessage = fetchedMessages[fetchedMessages.length - 1];
        if (!lastMessage.read) await readMessage(selectedUser._id);
      }

      // Scroll to the bottom of messages
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    };

    readAndGetMessages();
  }, [selectedUser]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [messages, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <UsersContext.Provider
      value={{
        users,
        setUsers,
        selectedUser,
        setSelectedUser,
        sendMessage,
        reactToMessage,
        deleteMessage,
        readMessage,
        messages,
        messagesInterfaceVisible,
        setMessagesInterfaceVisible,
        loadingUsers,
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
