import { FaRegMessage } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { logout } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useContext } from "react";
import { UsersContext } from "../pages/HomePage";
const Navbar: React.FC = () => {
  const { userAuth, setUserAuth } = useAuth();

  const { messagesInterfaceVisible } = useContext(UsersContext);

  return (
    <nav
      className={
        "h-14 min-h-14 lg:h-full flex lg:flex-col justify-between items-center bg-gray-900 text-white " +
        (messagesInterfaceVisible ? "max-lg:hidden" : "")
      }
    >
      <button className="h-full lg:h-16 lg:w-full flex items-center justify-center px-6 bg-linear-to-t from-aeora-400/40 to-transparent cursor-pointer relative after:absolute after:content=[''] after:w-full after:h-1 after:bottom-0 after:left-0 after:bg-aeora-400">
        <FaRegMessage />
      </button>
      <button
        className="h-full lg:h-16 flex items-center justify-center px-6 cursor-pointer text-xl text-gray-400 hover:text-white"
        onClick={() => logout(userAuth, setUserAuth)}
      >
        <MdLogout />
      </button>
    </nav>
  );
};

export default Navbar;
