import logoExtended from "../assets/logoExtended.svg";
import { IoMdSend } from "react-icons/io";
import { ImFilePicture } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import defaultUserImg from "../assets/defaultUser.svg";
import { useContext, useRef, useState } from "react";
import { UsersContext } from "../pages/HomePage";
import Message from "./Message";
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

  const [inputValue, setInputValue] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const handlePictureButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (pictureInputRef.current) {
      pictureInputRef.current.click();
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files[0];

    const fileSizeLimit = 1 * 1024 * 1024; // 2MB in bytes

    if (img) {
      if (img.size > fileSizeLimit) {
        toast.error("File size exceeds 1MB limit");
        return;
      }

      setSelectedImageFile(img);

      const reader = new FileReader();

      // When the file is loaded, set the preview URL to state
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };

      reader.readAsDataURL(img);
    }
    return;

    if (img) {
      const loadingToast = toast.loading("Uploading...");
      try {
        // Get a link for S3 file upload
        const response = await axios.post(`${BASE_URL}/api/get-upload-url`, {
          headers: { Authorization: `${userAuth.accessToken}` },
        });

        if (response.data.uploadUrl) {
          // If S3 link has been provided then upload it to S3
          const url = response.data.uploadUrl;
          const uploadedPictureUrl = await uploadImage(img, url);

          if (uploadedPictureUrl) {
            // If file has been successfully uploaded to S3 then change profile picture in DB
            const changeProfilePictureRes = await changeProfilePicture(uploadedPictureUrl, userAuth, setUserAuth);
            if (changeProfilePictureRes) {
              // If all actions are successful inform the user and change profile picture
              // console.log(changeProfilePictureRes);
              toast.dismiss(loadingToast);
              toast.success("Uploaded");
            }
          }
        }
      } catch (err: any) {
        // toast.error(err.response?.data?.message || "Uploading a picture failed");
        throw err;
      }
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

  const handleImageRemoval = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setImagePreviewUrl("");
    setSelectedImageFile(null);
  };

  const handleMessageSend = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!inputValue.trim()) return; // Prevent sending empty messages
    sendMessage(inputValue, selectedImageFile);
    setInputValue("");
    setImagePreviewUrl("");
    setSelectedImageFile(null);
  };

  return Object.keys(selectedUser).length === 0 ? (
    <div className="hidden w-full h-full lg:flex flex-col justify-center items-center gap-y-3">
      <div className="w-34 lg:w-38 mt-8">
        <img src={logoExtended} alt="logo" className="w-full h-full object-cover" />
      </div>
      <h2 className="text-xl">Welcome to Aeora messaging app</h2>
    </div>
  ) : (
    <div className={"w-full grow flex-col " + (messagesInterfaceVisible ? "flex" : "max-md:hidden")}>
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
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 self-center mx-auto"></div>
        </div>
      ) : (
        <div className="flex flex-col overflow-y-auto mt-auto p-2 gap-y-1">
          {messages.map((message, i) => (
            <Message key={i} message={message} innerRef={messagesEndRef} />
          ))}
        </div>
      )}

      {/* Bottom input */}
      <div className="sticky bg-white bottom-0 left-0 flex items-center">
        <input
          id="uploadPicture"
          ref={pictureInputRef}
          type="file"
          accept=".png, .jpg, .jpeg"
          hidden
          onChange={handlePictureUpload}
        />

        <form className="w-full flex items-end gap-x-2 relative py-2 px-3" onSubmit={handleMessageSend}>
          {/* Image upload */}
          <button className="cursor-pointer text-aeora py-1" onClick={handlePictureButtonClick}>
            <ImFilePicture className="text-xl" />
          </button>

          <div className={"w-full flex flex-col bg-gray-400/25 rounded-md"}>
            {imagePreviewUrl && (
              <div className="relative flex justify-end p-2">
                <img src={imagePreviewUrl} alt="" className="w-20 h-20 self-end m-3 rounded-sm" />
                <button
                  className="absolute top-0 right-0 translate-x-[-25%] translate-y-[25%] p-1 bg-aeora rounded-full cursor-pointer"
                  onClick={handleImageRemoval}
                >
                  <IoMdClose className="text-xl" />
                </button>
              </div>
            )}
            {/* Text input */}
            <textarea
              placeholder="..."
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleTextareaEnter}
              className="px-4 py-1 resize-none outline-none text-gray-900"
              rows={1}
            />
          </div>

          {/* Send button */}
          <button type="submit" className="cursor-pointer text-aeora py-1">
            <IoMdSend className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesInterface;
