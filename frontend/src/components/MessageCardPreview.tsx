import { IoCheckmarkDone } from "react-icons/io5";
import type { MessageCardPreviewProps } from "../utils/interface.ts";
import defaultUserImg from "../assets/defaultUser.svg";
import { useContext } from "react";
import { UsersContext } from "../pages/HomePage.tsx";
import { useAuth } from "../context/AuthContext.tsx";

const MessageCardPreview: React.FC<MessageCardPreviewProps> = ({
  id,
  firstName,
  surname,
  profileImg,
  lastMessage = "",
  lastMessageByUser,
  read,
}) => {
  const { setMessagesInterfaceVisible, users, selectedUser, setSelectedUser, readMessage, setLoadingMessages } =
    useContext(UsersContext);

  const {
    userAuth: { onlineUsers },
  } = useAuth();

  const handleUserSelection = async () => {
    const newSelectedUser = users.find((user) => user._id === id);
    if (selectedUser === newSelectedUser) return;
    setMessagesInterfaceVisible(true);
    setLoadingMessages(true);
    setSelectedUser(newSelectedUser);

    // If the last message hasn't been sent by the user and the user didin't read it then change
    // the status of the message to read
    if (newSelectedUser.lastMessage?.read === false && newSelectedUser.lastMessage.sentByUser === false) {
      await readMessage(newSelectedUser._id);
    }
  };

  return (
    <div className="flex gap-x-6 p-4 cursor-pointer hover:bg-gray-400/30 rounded-lg" onClick={handleUserSelection}>
      <div className="relative flex justify-center items-center min-w-12 min-h-12 w-12 h-12">
        <img
          src={profileImg ? profileImg : defaultUserImg}
          alt="user image"
          className="object-cover rounded-full"
          referrerPolicy="no-referrer"
        />
        {onlineUsers?.includes(id) && (
          <span className="absolute left-0 bottom-0 -translate-x-1/4 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></span>
        )}
      </div>

      <div className="flex flex-col justify-between">
        <p className="capitalize">
          {firstName} {surname}
        </p>
        <p className={"line-clamp-1 w-full text-sm " + (!read && !lastMessageByUser ? "font-bold text-gray-700" : "text-gray-500")}>
          {lastMessageByUser ? "You: " : ""}
          {typeof(lastMessage) === "string" ? lastMessage : `Sent images (${lastMessage.length})`}
        </p>
      </div>

      {/* Read */}
      {read && lastMessageByUser && (
        <div className="self-end ml-auto text-aeora-400 text-xl">
          <IoCheckmarkDone />
        </div>
      )}
    </div>
  );
};

export default MessageCardPreview;
