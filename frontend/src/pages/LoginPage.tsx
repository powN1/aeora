import logo from "../assets/logo.svg";
import logoExtended from "../assets/logoExtended.svg";
import mobileAeora from "../assets/mobileaeora.png";
import googleLogo from "../assets/google.svg";
import facebookLogo from "../assets/facebook.svg";
import { loginGoogleUser, loginFacebookUser, login } from "../services/authService";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import { Link } from "react-router-dom";
import { UserLogin } from "../utils/interface";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { userAuth, setUserAuth } = useAuth();

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

  const loginUser = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    // Error checking
    if (!emailInputValue.length) return toast.error("Enter email");

    const userData: UserLogin = {
      email: emailInputValue,
      password: passwordInputValue,
    };

    await login(userData, setUserAuth);
  };

  const loginDemoUser = async() => {
    const userData: UserLogin = {
      email: import.meta.env.VITE_DEMO_ACC_EMAIL,
      password: import.meta.env.VITE_DEMO_ACC_PASSWORD,
    };

    await login(userData, setUserAuth);
  };

  return (
    <div className="bg-gray-100">
      <ToastContainer position="top-center" />
      <div className="h-screen lg:w-[60%] px-4 lg:px-0 mx-auto flex flex-col gap-y-8 overflow-hidden ">
        <Link to="/" className="w-34 lg:w-38 mt-8">
          <img src={logoExtended} alt="logo" className="w-full h-full object-cover" />
        </Link>
        <section className="flex">
          {/* Left side lg */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start gap-y-6">
            {/* Slogan */}
            <h1 className="text-4xl md:w-3/4 md:text-5xl lg:text-7xl text-center lg:text-start font-bold pb-3 text-aeora">
              Express yourself in your own way
            </h1>
            {/* { Login form } */}
            <form onSubmit={loginUser} className="flex flex-col gap-y-4 w-full md:w-1/2 px-1">
              <p>
                New to Aeora?{" "}
                <Link
                  to="/register"
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
            <div className="flex flex-col w-full md:w-1/2 gap-y-6">
              <button
                className="py-3 border border-gray-300 flex justify-center items-center gap-x-3 rounded-full text-black cursor-pointer"
                onClick={async () => await loginGoogleUser(setUserAuth)}
              >
                <img src={googleLogo} alt="facebook logo" className="w-6" />
                <p className="">
                  Continue with <span className="font-bold">google</span>
                </p>
              </button>

              <button
                className="py-3 border border-gray-300 flex justify-center items-center gap-x-3 rounded-full text-black cursor-pointer"
                onClick={async () => await loginFacebookUser(setUserAuth)}
              >
                <img src={facebookLogo} alt="facebook logo" className="w-6" />
                <p className="">
                  Continue with <span className="font-bold">facebook</span>
                </p>
              </button>

              {/* <div className="flex items-center"> */}
              {/*   <div className="w-1/2 h-[1px] bg-gray-400/20"></div> */}
              {/*   <p className="mb-1 mx-3">or</p> */}
              {/*   <div className="w-1/2 h-[1px] bg-gray-400/20"></div> */}
              {/* </div> */}
              <button
                className="py-3 border border-gray-300 flex justify-center items-center gap-x-3 rounded-full text-black cursor-pointer"
                onClick={async () => await loginDemoUser()}
              >
                <img src={logo} alt="facebook logo" className="w-6" />
                <p className="">
                  Check with <span className="font-bold ">demo account</span>
                </p>
              </button>
            </div>
          </div>
          {/* Right side lg */}
          <div className="hidden lg:flex w-1/2 relative justify-center items-center px-3">
            <div className="w-2/3 flex justify-center items-center">
              <img src={mobileAeora} alt="" className="w-full object-cover rounded-lg" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
