import logoExtended from "../assets/logoExtended.svg";
import { IoMdSend } from "react-icons/io";
import { ImFilePicture } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import defaultUserImg from "../assets/defaultUser.svg";
import { useContext, useRef, useState } from "react";
import { UsersContext } from "../pages/HomePage";
import Message from "./Message";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

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

  const [inputValue, setInputValue] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [selectedImagesFiles, setSelectedImagesFiles] = useState<File[]>([]);

  const [selectedMessage, setSelectedMessage] = useState({});
  const [isReplying, setIsReplying] = useState(false);

  const handlePictureButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (pictureInputRef.current) {
      pictureInputRef.current.click();
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const images = e.target.files;
    const imagesArray = Array.from(images);

    const fileSizeLimit = 1 * 1024 * 1024; // 2MB in bytes
    const maxFiles = 20; // Set your maximum allowed number of files

    if (imagesArray.length > maxFiles) {
      toast.error(`Max ${maxFiles} images for upload`);
      return;
    }

    // Check for exceeding file size and stop if any of files are exceeding
    for (const image of imagesArray) {
      if (image.size > fileSizeLimit) {
        toast.error("Max 1MB file size");
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
      e.preventDefault(); // Prevents new line (default behavior)
      handleMessageSend(e as any); // Manually trigger form submission
    }
  };

  const handleImageRemoval = (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    e.preventDefault();
    setImagePreviewUrls((prevUrls) => prevUrls.filter((_, idx) => idx !== i));
    setSelectedImagesFiles((prevImages) => prevImages.filter((_, idx) => idx !== i));
  };

  const handleMessageSend = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!inputValue.trim() && selectedImagesFiles.length === 0) return; // Prevent sending empty messages
    if (inputValue.length !== 0) sendMessage(inputValue, [], selectedMessage._id);
    else if (selectedImagesFiles.length !== 0) sendMessage("", selectedImagesFiles, selectedMessage._id);
    setInputValue("");
    setImagePreviewUrls([]);
    setSelectedImagesFiles([]);
    setSelectedMessage({});
    setIsReplying(false);
  };

  const handleMessageReplyingClosure = () => {
    setIsReplying(false);
    setSelectedMessage({});
  };
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
        "h-full w-full max-w-full lg:w-19/25 lg:max-w-19/25 flex-col bg-repeat aeora-pattern-bg " +
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
        <div className="flex flex-col overflow-y-auto mt-auto p-2 gap-y-1">
          {messages.map((message, i) => (
            <Message
              key={i}
              i={i}
              textareaRef={textareaRef}
              selectedMessage={selectedMessage}
              setSelectedMessage={setSelectedMessage}
              setIsReplying={setIsReplying}
              message={message}
            />
          ))}
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

          <div className={"w-full max-w-[84%] lg:max-w-[95%] flex flex-col bg-gray-400/25 rounded-md"}>
            {/* Replying to */}
            {isReplying && (
              <div className="flex items-center w-full lg:max-w-1/3 px-2 py-3 gap-x-2">
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
          </div>

          {/* Send button */}
          <button type="submit" className="grow flex justify-center items-center cursor-pointer text-aeora py-1">
            <IoMdSend className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesInterface;
