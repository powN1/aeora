import MessageCardPreview from "./MessageCardPreview";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useContext, useEffect, useState } from "react";
import { UsersContext } from "../pages/HomePage.tsx";
import { IoMdClose } from "react-icons/io";
import Loader from "./Loader.tsx";

const MessagesList: React.FC = () => {
  const { messagesInterfaceVisible, users, loadingUsers } = useContext(UsersContext);
  const [inputValue, setInputValue] = useState("");
  const [localUsers, setLocalUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setLocalUsers(() =>
      users.filter((user) => {
        const username = user.firstName + " " + user.surname;
        return username.toLowerCase().includes(value);
      })
    );
  };

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  return (
    <div
      className={
        "flex flex-col gap-y-2 lg:w-5/25 lg:min-w-5/25 lg:px-2 pt-3 border-r border-gray-400/30 sticky " +
        (messagesInterfaceVisible && "max-lg:hidden")
      }
    >
      {/* Search input */}
      <div className="flex items-center gap-x-4 px-2 lg:px-0">
        <div className="grow flex relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={inputValue}
            onChange={handleInputChange}
            className="w-full p-2 px-4 pl-10 border border-gray-400/50 rounded-full outline-none"
          />
          <button className="text-aeora text-xl absolute top-1/2 left-0 translate-y-[-50%] ml-3">
            <FaMagnifyingGlass />
          </button>

          {inputValue && (
            <button
              className="text-xl absolute top-1/2 right-0 translate-y-[-50%] mr-3 cursor-pointer"
              onClick={() => {
                setInputValue("");
                setLocalUsers(users);
              }}
            >
              <IoMdClose className="" />
            </button>
          )}
        </div>
      </div>

      {/* Users */}

      {loadingUsers  ? (
        <Loader />
      ) : (
        <div className="flex flex-col overflow-y-scroll">
          {localUsers.map((user, i) => {
            return (
              <MessageCardPreview
                key={i}
                id={user._id}
                firstName={user.firstName}
                surname={user.surname}
                profileImg={user.profileImg}
                lastMessage={user.lastMessage?.text}
                lastMessageByUser={user.lastMessage?.sentByUser}
                read={user.lastMessage?.read}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessagesList;
