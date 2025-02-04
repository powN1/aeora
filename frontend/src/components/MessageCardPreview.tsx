import { IoCheckmarkDone } from "react-icons/io5";
import type { MessageCardPreviewProps } from "../utils/interface.ts";
import defaultUserImg from "../assets/defaultUser.svg"

const MessageCardPreview: React.FC<MessageCardPreviewProps> = ({ firstName, surname, profileImg, lastMessage, read }) => {
  return (
    <div className="flex gap-x-6 p-4 border-b border-gray-400/40 cursor-pointer">
      <div className="flex justify-center items-center w-12 h-12">
        <img src={profileImg ? profileImg : defaultUserImg} alt="user profile image" className="rounded-full"/>
      </div>

      <div className="flex flex-col">
        <p className="capitalize">{firstName} {surname}</p>
        <p className={"" + (!read && "font-bold")}>{lastMessage}</p>
      </div>

      {/* Read */}
      {read && (
        <div className="self-end ml-auto text-aeora-400 text-xl">
          <IoCheckmarkDone />
        </div>
      )}
    </div>
  );
};

export default MessageCardPreview;
