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
  lastMessage,
  read,
}) => {
  const { setMessagesInterfaceVisible, users, selectedUser, setSelectedUser, setLoadingMessages } = useContext(UsersContext);
  const {
    userAuth: { onlineUsers },
  } = useAuth();

  const handleUserSelection = () => {
    const newSelectedUser = users.find((user) => user._id === id);
    if(selectedUser === newSelectedUser) return;
    setMessagesInterfaceVisible(true);
    setSelectedUser(newSelectedUser);
    setLoadingMessages(true);
  };

  return (
    <div className="flex gap-x-6 p-4 cursor-pointer hover:bg-gray-400/30 rounded-lg" onClick={handleUserSelection}>
      <div className="relative flex justify-center items-center w-12 h-12">
        <img
          src={profileImg ? profileImg : defaultUserImg}
          alt="user image"
          className="rounded-full"
          referrerPolicy="no-referrer"
        />
        {onlineUsers?.includes(id) && (
          <span className="absolute left-0 bottom-0 -translate-x-1/4 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></span>
        )}
      </div>

      <div className="flex flex-col">
        <p className="capitalize">
          {firstName} {surname}
        </p>
        <p className={"" + (!read && "font-bold")}>{lastMessage}</p>
      </div>

      {/* Read */}
      {read && (
        <div className="self-end ml-auto text-aeora-400 text-xl">
          <IoCheckmarkDone />
        </div>
      )}
    </div>
  );
};

export default MessageCardPreview;
