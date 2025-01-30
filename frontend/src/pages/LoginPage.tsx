import logoExtended from "../assets/logoExtended.svg";
import googleLogo from "../assets/google.svg";
import facebookLogo from "../assets/facebook.svg";
import { loginGoogleUser, loginFacebookUser, login } from "../services/authService";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import { Link } from "react-router-dom";
import { UserLogin } from "../utils/interface";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { setUserAuth } = useAuth();

  const [emailInputValue, setEmailInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    switch (e.target.id) {
      case "email":
        setEmailInputValue(value);
        break;
      case "password":
        setPasswordInputValue(value);
        break;
      default:
        return;
    }
  };

  const loginUser = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    // Error checking
    if (!emailInputValue.length) return toast.error("Enter email");

    const userData: UserLogin = {
      email: emailInputValue,
      password: passwordInputValue,
    };

    login(userData, setUserAuth);
  };
  return (
    <div className="bg-gray-100">
      <ToastContainer position="top-center" />
      <div className="h-screen lg:w-[60%] mx-auto flex flex-col gap-y-8 overflow-hidden px-1">
        <Link to="/" className="w-38 mt-8">
          <img src={logoExtended} alt="logo" className="w-full h-full object-cover" />
        </Link>
        <section className="flex">
          {/* Left side lg */}
          <div className="w-1/2 flex flex-col gap-y-6">
            {/* Slogan */}
            <h1 className="text-7xl font-bold pb-3 text-aeora">Express yourself in your own way</h1>
            {/* { Login form } */}
            <form onSubmit={loginUser} className="flex flex-col gap-y-4 w-1/2">
              <p>
                New to Aeora?{" "}
                <Link
                  to="/sign-up"
                  className="relative after:content-[''] after:w-full after:h-[1px] after:absolute after:bottom-0 after:left-0 after:bg-black after:hidden hover:after:block text-aeora font-bold"
                >
                  Create an accout.
                </Link>
              </p>
              <input
                id="email"
                type="text"
                placeholder="Address email"
                value={emailInputValue}
                onChange={handleInputChange}
                className="py-2 px-4 bg-gray-200/80 rounded-md"
              />
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={passwordInputValue}
                onChange={handleInputChange}
                className="py-2 px-4 bg-gray-200 rounded-md"
              />
              <button
                type="submit"
                className="w-full self-start py-2 rounded-full bg-aeora hover:bg-aeora-300 text-lg text-white font-bold cursor-pointer "
              >
                Login
              </button>
            </form>
            {/* Login buttons */}
            <div className="flex flex-col w-1/2 gap-y-6">
              {/* <div className="flex w-2/3 mx-auto py-2 -mt-5 -mb-5 items-center"> */}
              {/*   <div className="bg-gray-300 h-[1px] w-full"></div> */}
              {/*   <div className="p-2 -mt-1 text-gray-500">or</div> */}
              {/*   <div className="bg-gray-300 h-[1px] w-full"></div> */}
              {/* </div> */}
              <button
                className="py-3 border border-gray-300 flex justify-center items-center gap-x-3 rounded-full text-black cursor-pointer"
                onClick={() => loginGoogleUser()}
              >
                <img src={googleLogo} alt="facebook logo" className="w-6" />
                <p className="">
                  Continue with <span className="font-bold">google</span>
                </p>
              </button>

              <button
                className="py-3 border border-gray-300 flex justify-center items-center gap-x-3 rounded-full text-black cursor-pointer"
                onClick={() => loginFacebookUser()}
              >
                <img src={facebookLogo} alt="facebook logo" className="w-6" />
                <p className="">
                  Continue with <span className="font-bold">facebook</span>
                </p>
              </button>
            </div>
          </div>
          {/* Right side lg */}
          <div className="w-1/2 relative flex justify-center items-center">
            <img src="" alt="" className="w-2/3 rotate-6" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
