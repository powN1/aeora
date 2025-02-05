import { IoCheckmarkDone } from "react-icons/io5";
import type { MessageCardPreviewProps } from "../utils/interface.ts";
import defaultUserImg from "../assets/defaultUser.svg";
import { useContext } from "react";
import { UsersContext } from "../pages/HomePage.tsx";

const MessageCardPreview: React.FC<MessageCardPreviewProps> = ({
  id,
  firstName,
  surname,
  profileImg,
  lastMessage,
  read,
}) => {
  const { users, setSelectedUser } = useContext(UsersContext);

  const handleUserSelection = () => {
    const selectedUser = users.find((user) => (user._id === id));
    setSelectedUser(selectedUser);
  };

  return (
    <div className="flex gap-x-6 p-4 cursor-pointer hover:bg-gray-400/30 rounded-lg" onClick={handleUserSelection}>
      <div className="flex justify-center items-center w-12 h-12">
        <img src={profileImg ? profileImg : defaultUserImg} alt="user profile image" className="rounded-full" />
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
