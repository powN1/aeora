import { useContext } from "react";
import { UsersContext } from "../pages/HomePage";

const Message = ({ message }) => {
  const { selectedUser } = useContext(UsersContext);
  return (
    <div
      className={`flex justify-center items-center px-3 py-1 bg-aeora rounded-full ${selectedUser._id === message.receiverId ? "self-end text-white" : "self-start bg-gray-400/25"}`}
    >
      {message.text}
    </div>
  );
};

export default Message;
