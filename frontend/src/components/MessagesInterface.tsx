import { IoMdSend } from "react-icons/io";
import { ImFilePicture } from "react-icons/im";
import defaultUserImg from "../assets/defaultUser.svg";
import { useAuth } from "../context/AuthContext";
import { useContext, useState } from "react";
import { UsersContext } from "../pages/HomePage";
import Message from "./Message";
const MessagesInterface: React.FC = () => {
  const { messages, sendMessage } = useContext(UsersContext);

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleMessageSend = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="hidden w-3/4 lg:flex flex-col">
      {/* User information */}
      <div className="flex items-center gap-x-3 h-16 px-4 [box-shadow:_2px_2px_6px_rgb(0_0_0_/_10%)]">
        <div className="w-10 h-10">
          <img src={defaultUserImg} alt="user profile image" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-between">
          <p className="capitalize">user name</p>
          <p className="text-xs">email@gas.sd</p>
        </div>
      </div>

      {/* { Messages container} */}
      <div className="grow flex flex-col justify-end p-2 overflow-y-auto gap-y-1">
        {messages.map((message, i) => (
          <Message key={i} message={message}/>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-x-4 p-4">
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
