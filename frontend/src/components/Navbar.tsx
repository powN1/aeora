import { FaRegMessage } from "react-icons/fa6";
import { CiSettings } from "react-icons/ci";
import { MdLogout } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { logout } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useContext } from "react";
import { UsersContext } from "../pages/HomePage";
import { Link, NavLink, useLocation } from "react-router-dom";
const Navbar: React.FC = () => {
  const { userAuth, setUserAuth } = useAuth();
  const location = useLocation();

  const { messagesInterfaceVisible } = useContext(UsersContext);

  return (
    <nav
      className={
        "lg:w-1/25 h-14 min-h-14 lg:h-full flex lg:flex-col justify-between items-center bg-gray-900 text-white " +
        (messagesInterfaceVisible ? "max-lg:hidden" : "")
      }
    >
      {/* Messages */}
      <NavLink
        to="/"
        className={
          "h-full lg:h-16 lg:w-full flex items-center justify-center px-6 cursor-pointer text-gray-400 hover:text-white " +
          (location.pathname === "/" &&
            "bg-linear-to-t from-aeora-400/40 to-transparent relative after:absolute after:content=[''] after:w-full after:h-1 after:bottom-0 after:left-0 after:bg-aeora-400 text-white")
        }
      >
        <FaRegMessage />
      </NavLink>

      <div className="h-full lg:w-full lg:h-auto flex lg:flex-col">
        {/* Settings */}
        <NavLink
          to="/settings"
          className={
            "h-full lg:h-16 flex items-center justify-center px-6 cursor-pointer text-xl text-gray-400 hover:text-white " +
            (location.pathname === "/settings" &&
              "bg-linear-to-t from-aeora-400/40 to-transparent relative after:absolute after:content=[''] after:w-full after:h-1 after:bottom-0 after:left-0 after:bg-aeora-400 text-white")
          }
        >
          <IoIosSettings />
        </NavLink>

        {/* Logout */}
        <button
          className="h-full lg:h-16 flex items-center justify-center px-6 cursor-pointer text-xl text-gray-400 hover:text-white"
          onClick={() => logout(userAuth, setUserAuth)}
        >
          <MdLogout />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
