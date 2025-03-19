import logoExtended from "../assets/logoExtended.svg";
import { IoMdSend } from "react-icons/io";
import { ImFilePicture } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import defaultUserImg from "../assets/defaultUser.svg";
import { useContext, useState } from "react";
import { UsersContext } from "../pages/HomePage";
import Message from "./Message";

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

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleMessageSend = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    sendMessage(inputValue);
    setInputValue("");
  };

  return Object.keys(selectedUser).length === 0 ? (
    <div className="hidden w-full h-full sm:flex flex-col justify-center items-center gap-y-3">
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

      {/* Input */}
      <div className="sticky bg-white bottom-0 left-0 flex items-center gap-x-4 p-4">
        <button className="cursor-pointer text-aeora">
          <ImFilePicture className="text-xl" />
        </button>
        <form className="grow flex relative" onSubmit={handleMessageSend}>
          <input
            type="text"
            placeholder="..."
            value={inputValue}
            onChange={handleInputChange}
            className="w-full p-2 px-4 border border-gray-400/50 rounded-full outline-none"
          />
          <button type="submit" className="cursor-pointer text-aeora">
            <IoMdSend className="text-xl absolute top-1/2 right-0 translate-y-[-50%] mr-3" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesInterface;
