import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UsersContext } from "../pages/HomePage";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaReply } from "react-icons/fa";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const Message = ({ i, textareaRef, selectedMessage, setSelectedMessage, setIsReplying, message }) => {
  const { reactToMessage, deleteMessage, selectedUser } = useContext(UsersContext);
  const {
    userAuth: { id },
  } = useAuth();

  const [showOptions, setShowOptions] = useState(false);
  const [showEmojiToolbar, setShowEmojiToolbar] = useState(false);
  const [isTopHalf, setIsTopHalf] = useState(true);
  // const [reactionsSorted, setReactionsSorted] = useState([]);

  const optionsPopupRef = useRef(null); // Ref for the options menu
  const emojiPopupRef = useRef(null); // Ref for the emoji menu
  const emojiExpandedPopupRef = useRef(null); // Ref for the emoji menu

  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢"]; // Customize as needed
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleMessageDeletion = () => {
    deleteMessage(message._id);
    setShowOptions(false);
  };

  const handleMessageReaction = (emoji: string) => {
    setPickerOpen(false);
    setShowEmojiToolbar(false);
    reactToMessage(message._id, emoji);
  };

  const handleMessageReplying = () => {
    setIsReplying(true);
    setSelectedMessage(message);
    textareaRef.current.focus();
  };

  const reactionsSorted = useMemo(() => {
    const grouped = message.reactions.reduce(
      (acc, curr) => {
        const existing = acc.find((r) => r.emoji === curr.emoji);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ emoji: curr.emoji, count: 1 });
        }
        return acc;
      },
      [] as { emoji: string; count: number }[]
    );

    return grouped.sort((a, b) => b.count - a.count);
  }, [message.reactions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsPopupRef.current && !optionsPopupRef.current.contains(e.target)) {
        setShowOptions(false);
      }
      if (emojiPopupRef.current && !emojiPopupRef.current.contains(e.target)) {
        setShowEmojiToolbar(false);
      }
      if (emojiExpandedPopupRef.current && !emojiExpandedPopupRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };

    if (showOptions || showEmojiToolbar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions, showEmojiToolbar]);

  return (
    <div className="w-full flex group">
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
              <div
                className={
                  "bg-gray-400/20 p-2 rounded-sm " + (selectedUser._id === message.receiverId ? "" : "self-start")
                }
              >
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
                "relative h-fit flex items-center gap-x-1 text-gray-500 mx-2 group-hover:visible " +
                (showOptions || showEmojiToolbar ? "visible" : "invisible")
              }
            >
              {/* Options popup */}
              {showOptions && (
                <div
                  ref={optionsPopupRef}
                  className={
                    "absolute left-0 translate-x-[-120%] flex flex-col bg-aeora-300 rounded-sm text-white border border-gray-700/20 " +
                    (isTopHalf ? "top-0" : "bottom-0")
                  }
                >
                  <button className="px-3 py-1 cursor-pointer hover:bg-aeora-200 " onClick={handleMessageDeletion}>
                    Delete
                  </button>
                  <button className="px-3 py-1 cursor-pointer hover:bg-aeora-200 ">Return</button>
                </div>
              )}

              {showEmojiToolbar && (
                <div
                  ref={emojiPopupRef}
                  className={
                    "absolute flex gap-1 py-2 px-3 bg-white rounded-full [box-shadow:_0px_0px_6px_rgb(0_0_0_/_20%)] " +
                    (isTopHalf ? "top-0 translate-y-[80%] " : "bottom-0 translate-y-[-80%] ") +
                    (selectedUser._id === message.receiverId ? "right-0" : "left-0")
                  }
                >
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleMessageReaction(emoji)}
                      className="cursor-pointer hover:scale-105 transition transform text-lg"
                    >
                      {emoji}
                    </button>
                  ))}

                  {/* Expand full picker */}
                  <button
                    onClick={() => setPickerOpen((prev) => !prev)}
                    className="cursor-pointer bg-gray-400/20 text-lg px-1 hover:bg-gray-200 rounded-full"
                  >
                    ➕
                  </button>

                  {pickerOpen && (
                    <div
                      ref={emojiExpandedPopupRef}
                      className={"absolute z-50 left-0 translate-x-[-44%] " + (isTopHalf ? "top-0" : "bottom-0")}
                    >
                      <Picker
                        onEmojiSelect={(emoji) => {
                          handleMessageReaction(emoji.native);
                        }}
                        theme="light"
                        title="Pick your reaction"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                className={"cursor-pointer " + (message.receiverId === id ? "hidden" : "")}
                onClick={(e) => {
                  setIsTopHalf(e.clientY < window.innerHeight / 2);
                  setSelectedMessage(message);
                  setShowOptions((prevState) => !prevState);
                }}
              >
                <BsThreeDotsVertical className="" />
              </button>
              <button className="cursor-pointer">
                <FaReply className="mr-1" onClick={handleMessageReplying} />
              </button>
              <button
                className="relative cursor-pointer"
                onClick={(e) => {
                  setIsTopHalf(e.clientY < window.innerHeight / 2);
                  setShowEmojiToolbar((prevState) => !prevState);
                }}
              >
                <MdOutlineEmojiEmotions />
              </button>
            </div>

            {/* Text messages */}
            {message.text !== "" && (
              <div className="flex flex-col">
                <div
                  className={
                    "flex justify-center items-center px-3 py-1 bg-aeora rounded-xl " +
                    (selectedUser._id === message.receiverId ? "text-white" : "text-gray-900 bg-gray-400/25")
                  }
                >
                  {message.text}
                </div>

                {message.reactions && message.reactions.length !== 0 && (
                  <div
                    className={
                      "flex justify-center items-center bg-white p-[2px] px-1 mb-1 [box-shadow:_2px_2px_3px_rgb(0_0_0_/_25%)] rounded-full self-end -mt-1 -ml-1 " +
                      (message.receiverId === id ? "flex-row-reverse " : " ")
                    }
                  >
                    {reactionsSorted.length > 1 && (
                      <p className="mx-1 text-gray-500 text-xs">{reactionsSorted.length}</p>
                    )}

                    {reactionsSorted.slice(0, 4).map((reaction) => {
                      return <div className="text-xs">{reaction.emoji}</div>;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Image messages */}
            {message.images && message.images.length !== 0 && (
              <div className="flex flex-col">
                <div className="flex items-center gap-x-2 ">
                  {message.images.map((image, i) => (
                    <div key={i} className="w-16 h-16 rounded-sm">
                      <img src={image} className="w-full h-full object-cover rounded-sm" />
                    </div>
                  ))}
                </div>

                {message.reactions && message.reactions.length !== 0 && (
                  <div
                    className={
                      "flex justify-center items-center bg-white p-[2px] px-1 mb-1 [box-shadow:_2px_2px_3px_rgb(0_0_0_/_25%)] rounded-full self-end -mt-1 -ml-1 " +
                      (message.receiverId === id ? "flex-row-reverse " : " ")
                    }
                  >
                    {reactionsSorted.length > 1 && (
                      <p className="mx-1 text-gray-500 text-xs">{reactionsSorted.length}</p>
                    )}

                    {reactionsSorted.slice(0, 4).map((reaction) => {
                      return <div className="text-xs">{reaction.emoji}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
