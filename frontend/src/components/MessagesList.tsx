import MessageCardPreview from "./MessageCardPreview";
import type { MessageCardPreviewProps } from "../utils/interface.ts";

interface MessagesListProps {
  users: MessageCardPreviewProps[];
}

const MessagesList: React.FC<MessagesListProps> = ({ users }) => {
  console.log(users);
  return (
    <div className="flex flex-col">
      {users.map((user, i) => {
        return <MessageCardPreview key={i} firstName={user.firstName} surname={user.surname} profileImg={user.profileImg} lastMessage="hello" read={true} />;
      })}
    </div>
  );
};

export default MessagesList;
