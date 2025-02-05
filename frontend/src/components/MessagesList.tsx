import MessageCardPreview from "./MessageCardPreview";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useContext } from "react";
import { UsersContext } from "../pages/HomePage.tsx";


const MessagesList: React.FC = () => {
  const { users } = useContext(UsersContext);

  return (
    <div className="flex flex-col gap-y-2 lg:w-1/4 lg:px-2 pt-3 border-r border-gray-400/30">
      <div className="flex items-center gap-x-4 px-2 lg:px-0">
        <div className="grow flex relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full p-2 px-4 border border-gray-400/50 rounded-full outline-none"
          />
          <button className="text-aeora">
            <FaMagnifyingGlass className="text-xl absolute top-1/2 right-0 translate-y-[-50%] mr-3" />
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        {users.map((user, i) => {
          return (
            <MessageCardPreview
              key={i}
              id={user._id}
              firstName={user.firstName}
              surname={user.surname}
              profileImg={user.profileImg}
              lastMessage="hello"
              read={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MessagesList;
