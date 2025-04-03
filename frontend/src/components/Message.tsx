import { useContext, useEffect, useRef, useState } from "react";
import { UsersContext } from "../pages/HomePage";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaReply } from "react-icons/fa";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const Message = ({ textareaRef, selectedMessage, setSelectedMessage, setIsReplying, message, innerRef }) => {
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

  const handleMessageReplying = () => {
    setIsReplying(true);
    setSelectedMessage(message);
    textareaRef.current.focus();
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
      <div
        className={
          "w-3/4 lg:w-1/2  justify-end flex items-center gap-x-2 " +
          (selectedUser._id === message.receiverId ? "ml-auto " : " ")
        }
      >
        <div className="w-full flex flex-col gap-y-1 items-end">
          {/* Reply message */}
          {message.replyingTo &&
            (message.replyingTo.text ? (
              <div
                className={
                  "px-3 py-1 rounded-xl bg-gray-400/20 text-gray-500 " +
                  (selectedUser._id === message.receiverId ? "" : "self-start")
                }
              >
                {message.replyingTo.text}
              </div>
            ) : (
              <div className="bg-gray-400/20 p-2 rounded-sm">
                  <div className="w-16 h-16 rounded-sm">
                    <img src={message.replyingTo.images[0]} className="w-full h-full object-cover rounded-sm" />
                  </div>
              </div>
            ))}

          <div
            className={
              "flex " +
              (message.receiverId === id ? "flex-row-reverse " : " ") +
              (selectedUser._id === message.receiverId ? "" : "self-start")
            }
          >
            {/* Options */}
            <div
              className={
                "relative flex items-center gap-x-1 text-gray-500 mx-2 group-hover:visible " +
                (showOptions ? "visible" : "invisible")
              }
            >
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
                  setSelectedMessage(message);
                  if (selectedMessage._id === message._id) setShowOptions((prevVal) => !prevVal);
                  else setShowOptions(true);
                }}
              >
                <BsThreeDotsVertical className="" />
              </button>
              <button className="cursor-pointer">
                <FaReply className="mr-1" onClick={handleMessageReplying} />
              </button>
              <button className="cursor-pointer">
                <MdOutlineEmojiEmotions />
              </button>
            </div>

            {/* Text messages */}
            {message.text !== "" && (
              <div
                className={`flex justify-center items-center px-3 py-1 bg-aeora rounded-xl ${selectedUser._id === message.receiverId ? "text-white" : "text-gray-900 bg-gray-400/25"}`}
                ref={innerRef}
              >
                {message.text}
              </div>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
