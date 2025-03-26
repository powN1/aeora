import { useContext, useEffect, useRef, useState } from "react";
import { UsersContext } from "../pages/HomePage";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaReply } from "react-icons/fa";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const Message = ({ selectedMessage, setSelectedMessage, message, innerRef }) => {
  const { deleteMessage, selectedUser } = useContext(UsersContext);
  const {
    userAuth: { id },
  } = useAuth();

  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef(null); // Ref for the floating menu

  const handleMessageDeletion = () => {
    deleteMessage(message._id);
    setShowOptions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  return (
    <div className={"w-full flex group"}>
      <div className={"flex items-center gap-x-2 " + (selectedUser._id === message.receiverId ? "ml-auto " : " ") + (message.receiverId === id ? "flex-row-reverse" : "")}>
        <div className={"relative text-gray-500 gap-x-1 items-center group-hover:flex " + (showOptions ? "flex" : "hidden")}>
          {/* Options popup */}
          {showOptions && (
            <div
              ref={menuRef}
              className="absolute left-0 bottom-0 translate-x-[-120%] flex flex-col bg-aeora-300 rounded-sm text-white border border-gray-700/20"
            >
              <button className="px-3 py-1 cursor-pointer hover:bg-aeora-200 " onClick={handleMessageDeletion}>
                Delete
              </button>
              <button className="px-3 py-1 cursor-pointer hover:bg-aeora-200 ">Return</button>
            </div>
          )}

          <button
            className={"cursor-pointer " + (message.receiverId === id ? "hidden" : "")}
            onClick={() => {
              setSelectedMessage(message._id);
              if (selectedMessage === message._id) setShowOptions((prevVal) => !prevVal);
              else setShowOptions(true);
            }}
          >
            <BsThreeDotsVertical className="" />
          </button>
          <button className="cursor-pointer">
            <FaReply className="mr-1" />
          </button>
          <button className="cursor-pointer">
            <MdOutlineEmojiEmotions />
          </button>
        </div>

        {/* Image messages */}
        {message.images && message.images !== 0 && (
          <div className="flex items-center gap-x-2 ">
            {message.images.map((image, i) => (
              <div key={i} className="w-16 h-16 rounded-sm">
                <img src={image} className="w-full h-full object-cover rounded-sm" />
              </div>
            ))}
          </div>
        )}

        {/* Text messages */}
        {message.text !== "" && (
          <div
            className={`flex justify-center items-center px-3 py-1 bg-aeora rounded-full ${selectedUser._id === message.receiverId ? "text-white" : "bg-gray-400/25"}`}
            ref={innerRef}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
