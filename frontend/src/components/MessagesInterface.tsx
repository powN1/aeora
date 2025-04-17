import logoExtended from "../assets/logoExtended.svg";
// Icons
import { IoMdSend, IoMdClose } from "react-icons/io";
import { ImFilePicture } from "react-icons/im";
import { IoCheckmarkDone } from "react-icons/io5";

import defaultUserImg from "../assets/defaultUser.svg";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { UsersContext } from "../pages/HomePage";
import Message from "./Message";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";

import Picker from "@emoji-mart/react";

// Swiper (image slider)
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { MdOutlineEmojiEmotions } from "react-icons/md";

const MessagesInterface: React.FC = () => {
  const {
    messagesInterfaceVisible,
    setMessagesInterfaceVisible,
    selectedUser,
    setSelectedUser,
    messages,
    sendMessage,
    loadingMessages,
    messagesEndRef,
  } = useContext(UsersContext);

  const pictureInputRef = useRef();
  const textareaRef = useRef();
  const sendButtonRef = useRef();

  const [inputValue, setInputValue] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [selectedImagesFiles, setSelectedImagesFiles] = useState<File[]>([]);

  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [sortedReactions, setSortedReactions] = useState([]);
  const [reactionsToShow, setReactionsToShow] = useState([]);
  const [currentReaction, setCurrentReaction] = useState("all");

  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [imagesToShow, setImagesToShow] = useState([]);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isReplying, setIsReplying] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const emojiExpandedPopupRef = useRef(null); // Ref for the emoji menu

  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢"];

  const handlePictureButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (pictureInputRef.current) {
      pictureInputRef.current.click();
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const images = e.target.files;
    const imagesArray = Array.from(images);

    const fileSizeLimit = 2 * 1024 * 1024; // 2MB in bytes
    const maxFiles = 8; // Set your maximum allowed number of files

    if (imagesArray.length > maxFiles) {
      toast.error(`Max ${maxFiles} images for upload`);
      return;
    }

    // Check for exceeding file size and stop if any of files are exceeding
    for (const image of imagesArray) {
      if (image.size > fileSizeLimit) {
        toast.error("Max 2MB file size");
        return;
      }
    }

    if (images) {
      const newPreviewUrls: string[] = [];
      const newSelectedImagesFiles: File[] = [];

      // Set preview image urls
      Array.from(images).forEach((file) => {
        newSelectedImagesFiles.push(file);

        const reader = new FileReader();

        reader.onloadend = () => {
          // Add each file's preview URL to the new array
          newPreviewUrls.push(reader.result as string);

          // Update the state after all files have been processed
          if (newPreviewUrls.length === images.length) {
            setImagePreviewUrls(newPreviewUrls);
            setSelectedImagesFiles(newSelectedImagesFiles);
          }
        };

        sendButtonRef.current.focus();
        reader.readAsDataURL(file);
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    // Resize the textarea as users adds new lines into the input
    textarea.style.height = "auto";
    textarea.style.height = e.target.scrollHeight + "px";
    const value = textarea.value;
    setInputValue(value);
  };

  const handleTextareaEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSend(e as any); // Manually trigger form submission
    }
  };

  const handleImageRemoval = (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    e.preventDefault();
    setImagePreviewUrls((prevUrls) => prevUrls.filter((_, idx) => idx !== i));
    setSelectedImagesFiles((prevImages) => prevImages.filter((_, idx) => idx !== i));
  };

  const handleMessageSend = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    const inputEmpty = !inputValue.trim();
    const imageFilesEmpty = selectedImagesFiles.length === 0;
    const isReply = selectedMessage?._id;

    e.preventDefault();
    if (inputEmpty && imageFilesEmpty) return; // Prevent sending empty messages

    if (!inputEmpty && imageFilesEmpty) sendMessage(inputValue, [], isReply && selectedMessage._id);
    else if (inputEmpty && !imageFilesEmpty) sendMessage("", selectedImagesFiles, isReply && selectedMessage._id);
    else if (!inputEmpty && !imageFilesEmpty) {
      sendMessage(inputValue, [], isReply && selectedMessage._id);
      sendMessage("", selectedImagesFiles, isReply && selectedMessage._id);
    }
    console.log(`input: ${inputValue}, images: ${selectedImagesFiles}, reply: ${selectedMessage?._id}`);
    setInputValue("");
    setImagePreviewUrls([]);
    setSelectedImagesFiles([]);
    setSelectedMessage(null);
    setIsReplying(false);
  };

  const handleMessageReplyingClosure = () => {
    setIsReplying(false);
    setSelectedMessage(null);
  };

  const handleReactionPopup = (message) => {
    const grouped = message.reactions.reduce((acc, reaction) => {
      const { emoji, userId } = reaction;
      const existing = acc.find((r) => r.emoji === emoji);

      if (existing) {
        existing.count += 1;
        existing.users.push(userId);
      } else {
        acc.push({
          emoji,
          count: 1,
          users: [userId],
        });
      }

      return acc;
    }, []);

    const sorted = grouped.sort((a, b) => b.count - a.count);

    console.log(sorted);
    setSortedReactions(sorted);
    setReactionsToShow(message.reactions);

    setReactions(message.reactions);
    setShowReactionsModal(true);
  };

  const handleShowSpecificReactions = (reactionEmoji: string, different = false) => {
    if (reactionEmoji !== "") {
      const toShow = reactions.filter((reaction) => reaction.emoji === reactionEmoji);
      setReactionsToShow(toShow);
      setCurrentReaction(reactionEmoji);
    } else if (different) {
      const toShow = reactions.filter((reaction) => {
        return !quickEmojis.includes(reaction.emoji) && reaction;
      });

      setCurrentReaction("other");
      setReactionsToShow(toShow);
    } else {
      setReactionsToShow(reactions);
      setCurrentReaction("all");
    }
  };

  const handleImagePreview = (message) => {
    setImagesToShow(message.images);
    setShowImagePreviewModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiExpandedPopupRef.current && !emojiExpandedPopupRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };

    if (pickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerOpen]);

  return Object.keys(selectedUser).length === 0 ? (
    <div className="hidden w-19/25 h-full lg:flex flex-col justify-center items-center gap-y-3">
      <div className="w-34 lg:w-38 mt-8">
        <img src={logoExtended} alt="logo" className="w-full h-full object-cover" />
      </div>
      <h2 className="text-xl">Welcome to Aeora messaging app</h2>
    </div>
  ) : (
    <div
      className={
        "relative h-full w-full max-w-full lg:w-19/25 lg:max-w-19/25 flex-col bg-repeat aeora-pattern-bg " +
        (messagesInterfaceVisible ? "flex" : "max-md:hidden")
      }
    >
      {/* User information */}
      <div className="sticky bg-white top-0 left-0 flex items-center gap-x-3 h-16 min-h-16 px-4 [box-shadow:_2px_2px_6px_rgb(0_0_0_/_10%)]">
        <div className="w-10 h-10">
          <img
            src={selectedUser.profileImg ? selectedUser.profileImg : defaultUserImg}
            alt="user image"
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col justify-between">
          <p className="capitalize">
            {selectedUser.firstName} {selectedUser.surname}
          </p>
          <p className="text-xs">{selectedUser.email}</p>
        </div>

        <button
          className="lg:hidden text-2xl ml-auto p-1 cursor-pointer"
          onClick={() => {
            setMessagesInterfaceVisible(false);
            setSelectedUser({});
          }}
        >
          <IoMdClose />
        </button>
      </div>

      {/* { Messages container} */}
      {loadingMessages ? (
        <Loader />
      ) : (
        <div className="h-full flex flex-col justify-end overflow-y-auto mt-auto p-2 gap-y-1">
          {messages.map((message, i) => (
            <Message
              key={i}
              textareaRef={textareaRef}
              setSelectedMessage={setSelectedMessage}
              setIsReplying={setIsReplying}
              message={message}
              handleReactionPopup={handleReactionPopup}
              handleImagePreview={handleImagePreview}
            />
          ))}
          {/* Read */}
          {messages[messages.length - 1]?.read && messages[messages.length - 1]?.senderId !== selectedUser._id && (
            <div className="flex gap-2 self-end">
              <p className="text-xs text-gray-400">
                Read {formatDistanceToNow(new Date(messages[messages.length - 1].readAt), { addSuffix: true })}
              </p>
              <IoCheckmarkDone className="text-aeora-400 text-xl" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Bottom input */}
      <div className="sticky bottom-0 left-0 bg-white flex items-center">
        <input
          id="uploadPicture"
          ref={pictureInputRef}
          type="file"
          accept=".png, .jpg, .jpeg"
          hidden
          multiple
          onChange={handlePictureUpload}
        />

        <form className="w-full max-w-full flex items-end gap-x-2 relative py-2 px-2" onSubmit={handleMessageSend}>
          {/* Image upload */}
          <button
            className="grow flex justify-center items-center cursor-pointer text-aeora py-1"
            onClick={handlePictureButtonClick}
          >
            <ImFilePicture className="text-xl" />
          </button>

          <div className={"relative w-full max-w-[84%] lg:max-w-[95%] flex flex-col bg-gray-400/25 rounded-md"}>
            {/* Replying to */}
            {isReplying && (
              <div className="flex items-center w-9/10 lg:max-w-1/3 px-2 py-3 gap-x-2">
                <div className="text-gray-900 line-clamp-1 rounded-md py-1 px-2 bg-gray-400/50">
                  {selectedMessage.text && selectedMessage.text}
                  {selectedMessage.images && selectedMessage.images[0] && (
                    <div className="w-16 h-16 rounded-sm">
                      <img src={selectedMessage.images[0]} className="w-full h-full object-cover rounded-sm" />
                    </div>
                  )}
                </div>
                <button className="cursor-pointer" onClick={handleMessageReplyingClosure}>
                  <IoMdClose className="text-xl" />
                </button>
              </div>
            )}

            {/* Image preview */}
            {imagePreviewUrls.length !== 0 && (
              <div className="w-full max-w-full flex flex-row-reverse p-5 gap-x-5 overflow-x-auto">
                {imagePreviewUrls.map((image, i) => (
                  <div key={i} className="relative w-20 h-20 flex-shrink-0">
                    <img src={image} alt="" className="w-full h-full rounded-sm" />
                    <button
                      className="absolute top-0 right-0 translate-x-[50%] translate-y-[-50%] p-1 bg-aeora rounded-full cursor-pointer"
                      onClick={(e) => handleImageRemoval(e, i)}
                    >
                      <IoMdClose className="text-xl" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Text input */}
            <textarea
              ref={textareaRef}
              placeholder="..."
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleTextareaEnter}
              className="px-4 py-1 resize-none outline-none text-gray-900"
              rows={1}
            />

            <div className="absolute bottom-0 right-0 px-3 py-2">
              <button
                className="flex justify-center items-center relative cursor-pointer text-gray-500"
                onClick={(e) => {
                  e.preventDefault();
                  setPickerOpen((prev) => !prev);
                }}
              >
                <MdOutlineEmojiEmotions />
              </button>

              {pickerOpen && (
                <div
                  ref={emojiExpandedPopupRef}
                  className="absolute -right-5 md:right-0 bottom-10 [box-shadow:_2px_2px_6px_rgb(0_0_0_/_30%)] rounded-sm"
                >
                  <Picker
                    onEmojiSelect={(emoji) => {
                      setInputValue((prevState) => prevState + emoji.native);
                    }}
                    theme="light"
                    title="Pick your reaction"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Send button */}
          <button
            type="submit"
            ref={sendButtonRef}
            className="grow flex justify-center items-center cursor-pointer text-aeora py-1"
          >
            <IoMdSend className="text-xl" />
          </button>
        </form>
      </div>

      {/* Reactions modal */}
      {showReactionsModal && (
        <div className="absolute w-full h-full bg-black/70 backdrop-blur-xs">
          <div className="w-4/5 lg:w-1/3 max-h-1/2 h-1/2 absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex flex-col bg-white rounded-lg border border-gray-400/50 [box-shadow:_2px_2px_6px_rgb(0_0_0_/_20%)]">
            <div className="relative">
              <h3 className="text-center text-lg text-black uppercase font-bold p-3 border-b border-gray-400/25 [box-shadow:_2px_2px_4px_rgb(0_0_0_/_10%)]">
                Reactions
              </h3>
              <div
                className="absolute top-1/2 right-3 translate-y-[-50%] cursor-pointer"
                onClick={() => setShowReactionsModal(false)}
              >
                <IoMdClose className="text-xl" />
              </div>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-3 px-4 py-2 mt-2">
              <button
                className={
                  "p-2 relative hover:after:h-[3px] after:absolute after:content-[''] after:bottom-0 after:left-0 after:w-full after:bg-aeora cursor-pointer " +
                  (currentReaction === "all" ? "after:h-[3px] text-aeora" : "")
                }
                onClick={() => handleShowSpecificReactions("", false)}
              >
                All {reactions.length}
              </button>
              {sortedReactions.map((reaction, i) => {
                return (
                  quickEmojis.includes(reaction.emoji) && (
                    <button
                      key={i}
                      className={
                        "p-2 relative hover:after:h-[3px] after:absolute after:content-[''] after:bottom-0 after:left-0 after:w-full after:bg-aeora cursor-pointer rounded-md " +
                        (currentReaction === reaction.emoji ? "after:h-[3px] text-aeora" : "")
                      }
                      onClick={() => handleShowSpecificReactions(reaction.emoji)}
                    >
                      {reaction.emoji} {reaction.count}
                    </button>
                  )
                );
              })}
              <button
                className={
                  "p-2 relative hover:after:h-[3px] after:absolute after:content-[''] after:bottom-0 after:left-0 after:w-full after:bg-aeora cursor-pointer " +
                  (currentReaction === "other" ? "after:h-[3px]" : "")
                }
                onClick={() => handleShowSpecificReactions("", true)}
              >
                Other
              </button>
            </div>
            <div className="flex flex-col px-4 py-2 overflow-y-auto">
              {reactionsToShow.map((reaction, i) => (
                <div key={i} className="flex items-center gap-x-3 py-2 rounded-lg">
                  <div>{reaction.emoji}</div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 mr-3">
                      <img src={reaction.userId.profileImg} alt="user img" className="w-full h-full rounded-full" />
                    </div>
                    <p>
                      {reaction.userId.firstName} {reaction.userId.surname}
                    </p>
                    <p></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {showImagePreviewModal && (
        <div className="absolute z-20 w-full h-full bg-black/70 backdrop-blur-xs">
          <div className="h-full flex flex-col items-center justify-between p-5">
            <button
              className="bg-gray-200 self-start justify-self-start rounded-full text-2xl p-1 cursor-pointer"
              onClick={() => {
                setShowImagePreviewModal(false);
              }}
            >
              <IoMdClose />
            </button>
            <div className="flex justify-center items-center max-w-3/4">
              {/* If theres only one image then dont use the slider */}
              {imagesToShow.length === 1 ? (
                <div className="h-[500px] w-full">
                  <img src={imagesToShow[0]} alt="img link" className="w-full h-full object-contain rounded-md" />
                </div>
              ) : (
                <Swiper
                  onSwiper={(swiper) => {
                    swiper.on("slideChange", () => setActiveImageIndex(swiper.activeIndex));
                  }}
                  modules={[Thumbs]}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="w-full lg:w-1/2 h-[500px]"
                >
                  {imagesToShow.map((src, i) => (
                    <SwiperSlide key={i}>
                      <img src={src} alt={`Image ${i}`} className="w-full h-full object-contain rounded-md" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
            <div className="w-full max-w-3/4 md:max-w-2/3 lg:max-w-1/2">
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[Thumbs, Navigation]}
                navigation
                slidesPerView={1}
                slidesPerGroup={3}
                spaceBetween={10}
                pagination
                breakpoints={{
                  360: {
                    slidesPerView: 3,
                    slidesPerGroup: 3,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 4,
                    slidesPerGroup: 4,
                    spaceBetween: 30,
                  },
                  1024: {
                    slidesPerView: 6,
                    slidesPerGroup: 6,
                    spaceBetween: 30,
                  },
                }}
                watchSlidesProgress
                className="max-w-full sample-slider"
              >
                {imagesToShow.map((src, i) => (
                  <SwiperSlide key={i}>
                    <img
                      src={src}
                      alt={`Thumb ${i}`}
                      className={`w-full h-24 md:h-36 lg:h-24 object-cover cursor-pointer rounded-md opacity-60 hover:opacity-100 transition-opacity ${activeImageIndex === i ? "opacity-100" : "opacity-60"}`}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesInterface;
