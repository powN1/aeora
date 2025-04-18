// React
import { useContext, useEffect, useMemo, useRef, useState } from "react";

// Libraries
import Picker from "@emoji-mart/react";

// Icons
import { FaReply } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { UsersContext } from "../pages/HomePage";
import { ILinkPreview } from "../utils/interface";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";

const Message = ({
  textareaRef,
  setSelectedMessage,
  setIsReplying,
  message,
  handleReactionPopup,
  handleImagePreview,
}) => {
  const { reactToMessage, deleteMessage, selectedUser } = useContext(UsersContext);
  const {
    userAuth: { id },
  } = useAuth();

  const [showOptions, setShowOptions] = useState(false);
  const [showEmojiToolbar, setShowEmojiToolbar] = useState(false);
  const [showEmojiToolbarMobile, setShowEmojiToolbarMobile] = useState(false);
  const [isTopHalf, setIsTopHalf] = useState(true);

  const optionsPopupRef = useRef(null);
  const mobileOptionsPopupRef = useRef(null);
  const emojiPopupRef = useRef(null);
  const emojiExpandedPopupRef = useRef(null);

  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢"];
  const [pickerOpen, setPickerOpen] = useState(false);

  // Mobile options
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMobileOptions, setShowMobileOptions] = useState(false);

  const handleMessageDeletion = () => {
    deleteMessage(message._id);
    setSelectedMessage(null);
    setShowOptions(false);
  };

  const handleMessageReaction = (emoji: string) => {
    setPickerOpen(false);
    setShowEmojiToolbar(false);
    setShowEmojiToolbarMobile(false);
    setShowMobileOptions(false);
    reactToMessage(message._id, emoji);
  };

  const handleMessageReplying = () => {
    setIsReplying(true);
    setShowEmojiToolbarMobile(false);
    setShowMobileOptions(false);
    setSelectedMessage(message);
    textareaRef.current.focus();
  };

  const handleTouchStart = (e) => {
    setSelectedMessage(message);
    setIsTopHalf(e.touches[0].clientY < window.innerHeight / 2);
    const timer = setTimeout(() => {
      setShowMobileOptions(true);
      setShowEmojiToolbarMobile(true);
    }, 500); // Adjust for your "hold" sensitivity
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
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
      if (mobileOptionsPopupRef.current && !mobileOptionsPopupRef.current.contains(e.target)) {
        setShowMobileOptions(false);
        setShowEmojiToolbarMobile(false);
      }
      if (emojiPopupRef.current && !emojiPopupRef.current.contains(e.target)) {
        setShowEmojiToolbar(false);
      }
      if (emojiExpandedPopupRef.current && !emojiExpandedPopupRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };

    if (showOptions || showEmojiToolbar || showMobileOptions) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showOptions, showEmojiToolbar, showMobileOptions]);

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
                  "px-3 py-1 rounded-xl bg-gray-200 text-gray-500 " +
                  (selectedUser._id === message.receiverId ? "" : "self-start")
                }
              >
                {message.replyingTo.text}
              </div>
            ) : (
              <div
                className={
                  "bg-gray-200 p-2 rounded-sm " + (selectedUser._id === message.receiverId ? "" : "self-start")
                }
              >
                <div className="w-16 h-16 rounded-sm">
                  <img src={message?.replyingTo?.images[0]} className="w-full h-full object-cover rounded-sm" />
                </div>
              </div>
            ))}

          <div
            className={
              "relative flex items-center justify-end " +
              (message.receiverId === id ? "flex-row-reverse " : " ") +
              (selectedUser._id === message.receiverId ? "" : "self-start")
            }
          >
            {/* Options */}
            <div
              className={
                "relative h-fit flex items-center gap-x-1 text-gray-500 mx-2 group-hover:visible " +
                ((showOptions || showEmojiToolbar) && !showMobileOptions ? "visible" : "invisible")
              }
            >
              {/* Options popup */}
              {showOptions && (
                <div
                  ref={optionsPopupRef}
                  className={
                    "absolute left-0 translate-x-[-120%] flex flex-col bg-aeora-300 cursor-pointer rounded-sm text-white border border-gray-700/20 " +
                    (isTopHalf ? "top-0" : "bottom-0")
                  }
                >
                  <button className="px-3 py-1 cursor-pointer hover:bg-aeora-200 " onClick={handleMessageDeletion}>
                    Delete
                  </button>
                </div>
              )}

              {showEmojiToolbar && (
                <div
                  ref={emojiPopupRef}
                  className={
                    "absolute z-10 flex gap-x-1 py-2 px-3 bg-white rounded-full [box-shadow:_0px_0px_6px_rgb(0_0_0_/_20%)] " +
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
                      className={
                        "absolute z-50 scale-90 " +
                        (isTopHalf ? "top-0 " : "bottom-0 ") +
                        (message.receiverId === id ? "left-0 " : "right-0 ") +
                        (isTopHalf
                          ? message.receiverId === id
                            ? "origin-top-left"
                            : "origin-top-right"
                          : message.receiverId === id
                            ? "origin-bottom-left"
                            : "origin-bottom-right")
                      }
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

            {/* Options mobile */}
            <div
              className={
                "absolute h-fit flex-col gap-y-3 text-gray-500 z-10 " +
                (showMobileOptions
                  ? isTopHalf
                    ? "bottom-0 flex-col-reverse translate-y-[102%] flex "
                    : "top-0 translate-y-[-102%] flex "
                  : "hidden ") +
                (message.receiverId === id ? "left-0" : "right-0")
              }
              ref={mobileOptionsPopupRef}
            >
              {/* Options popup */}
              <div
                className={
                  "flex flex-col rounded-lg bg-white opacity-97 [box-shadow:_0px_0px_6px_rgb(0_0_0_/_20%)] border border-gray-400/30 " +
                  (message.receiverId === id ? "self-end" : "self-start")
                }
              >
                <p className="flex items-center gap-x-2 px-3 py-2 text-sm">
                  {format(new Date(message.createdAt), "d MMM, H:mm")}
                </p>
                <button className="flex items-center gap-x-2 px-3 py-2" onClick={handleMessageReplying}>
                  <FaReply className="" />
                  <p>Reply</p>
                </button>
                <button className="flex items-center gap-x-2 px-3 py-2" onClick={handleMessageDeletion}>
                  <FaRegTrashAlt />
                  <p>Delete</p>
                </button>
              </div>

              {showEmojiToolbarMobile && (
                <div
                  className={"flex gap-x-2 py-2 px-3 bg-white rounded-full [box-shadow:_0px_0px_6px_rgb(0_0_0_/_20%)]"}
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
                    className="bg-gray-400/20 text-lg px-1 rounded-full"
                  >
                    ➕
                  </button>

                  {pickerOpen && (
                    <div
                      ref={emojiExpandedPopupRef}
                      className={
                        "absolute z-50 scale-80 " +
                        (isTopHalf ? "top-0 " : "bottom-0 ") +
                        (message.receiverId === id ? "left-0 " : "right-0 ") +
                        (isTopHalf
                          ? message.receiverId === id
                            ? "origin-top-left"
                            : "origin-top-right"
                          : message.receiverId === id
                            ? "origin-bottom-left"
                            : "origin-bottom-right")
                      }
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
            </div>

            {/* Text messages */}
            {message.text !== "" && (
              <div className={"flex flex-col " + (message.linkPreview && message.linkPreview.url ? "lg:w-1/3" : "")}>
                <div className="flex flex-col">
                  <div
                    className={
                      "flex justify-center items-center px-3 py-1 bg-aeora select-none lg:select-all " +
                      (selectedUser._id === message.receiverId ? "text-white " : "text-gray-900 bg-gray-200 ") +
                      (message.linkPreview && message.linkPreview.url ? "rounded-t-xl" : "rounded-xl")
                    }
                    onTouchStart={(e) => handleTouchStart(e)}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                  >
                    {message.linkPreview ? (
                      <Link
                        to={message.linkPreview.url || message.text}
                        target="_blank"
                        className="underline w-full break-all"
                      >
                        {message.linkPreview.url || message.text}
                      </Link>
                    ) : (
                      message.text
                    )}
                  </div>

                  {message.linkPreview && (
                    <div className="">
                      <Link to={message.linkPreview.url} target="_blank" rel="noopener noreferrer">
                        <div className="">
                          <img src={message.linkPreview.imageUrl} alt={message.linkPreview.title} />
                          <div className="bg-gray-200 p-2 rounded-b-xl">
                            <h3 className="text-ellipsis line-clamp-2 text-gray-900">{message.linkPreview.title}</h3>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {message.reactions && message.reactions.length !== 0 && (
                  <div
                    className={
                      "flex justify-center items-center bg-white p-[2px] px-1 mb-1 [box-shadow:_2px_2px_3px_rgb(0_0_0_/_25%)] rounded-full self-end -mt-1 -ml-1 cursor-pointer " +
                      (message.receiverId === id ? "flex-row-reverse " : " ")
                    }
                    onClick={() => handleReactionPopup(message)}
                  >
                    {reactionsSorted.length > 1 && (
                      <p className="mx-1 text-gray-500 text-xs">{reactionsSorted.length}</p>
                    )}

                    {reactionsSorted.slice(0, 4).map((reaction, i) => {
                      return (
                        <div key={i} className="text-xs">
                          {reaction.emoji}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Image messages */}
            {message.images && message.images.length !== 0 && (
              <div className="flex flex-col">
                <div
                  className={"flex items-center gap-x-2 " + (message.images.length > 4 ? "" : "")}
                  onTouchStart={(e) => handleTouchStart(e)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  <div
                    className={
                      "w-32 h-32 relative rounded-sm cursor-pointer [box-shadow:_2px_2px_6px_rgb(0_0_0_/_40%)] " +
                      (message.images.length > 1 ? "m-3" : "my-1")
                    }
                    onClick={() => handleImagePreview(message)}
                  >
                    {message.images.length > 1 && (
                      <>
                        <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-32 h-32 bg-gray-300 rounded-sm rotate-10"></div>
                        <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-32 h-32 bg-gray-200 rounded-sm rotate-5"></div>
                      </>
                    )}
                    <img src={message.images[0]} className="relative w-full h-full object-cover rounded-sm" />
                  </div>
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

                    {reactionsSorted.slice(0, 4).map((reaction, i) => {
                      return (
                        <div key={i} className="text-xs">
                          {reaction.emoji}
                        </div>
                      );
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
