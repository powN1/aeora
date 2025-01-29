import Logo from "../assets/logo.webp";
import PhoneImg from "../assets/phone.webp";
import LogoExtended from "../assets/logoExtended.webp";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { loginGoogleUser, loginFacebookUser } from "../services/authService";
import { useState } from "react";

const HomePage: React.FC = () => {
  const [emailInputValue, setEmailInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInputValue(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordInputValue(value);
  };

  return (
    <div className="bg-gray-100">
      <div className="h-screen lg:w-[60%] mx-auto flex flex-col gap-y-10 overflow-hidden px-1">
        <div className="w-16 mt-8">
          <img src={Logo} alt="logo" className="w-full h-full object-cover" />
        </div>
        <section className="flex">
          {/* Left side lg */}
          <div className="w-1/2 flex flex-col gap-y-12">
            {/* Slogan */}
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#b22bf9] to-[#5493f5]">
              Express yourself in your own way
            </h1>
            {/* { Login form } */}
            <div className="flex flex-col gap-y-4 w-1/2">
              <input
                id="email"
                type="text"
                placeholder="Address email"
                value={emailInputValue}
                onChange={handleEmailChange}
                className="py-2 px-4 bg-gray-200/80 rounded-md"
              />
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={passwordInputValue}
                onChange={handlePasswordChange}
                className="py-2 px-4 bg-gray-200 rounded-md"
              />
              <button className="self-start px-10 py-2 rounded-full bg-[#6b81f6] text-lg text-white font-bold cursor-pointer">
                Login
              </button>
            </div>
            {/* Login buttons */}
            <div className="flex flex-col w-1/2 gap-y-8">
              <button
                className="py-3 border border-gray-300 flex justify-center items-center gap-x-3 rounded-full text-black cursor-pointer"
                onClick={() => loginGoogleUser()}
              >
                <FaGoogle className="text-yellow-400 text-lg" />
                <p className="">
                  Sign in through <span className="font-bold">google</span>
                </p>
              </button>

              <button
                className="py-3 border border-gray-300 flex justify-center items-center gap-x-3 rounded-full text-black cursor-pointer"
                onClick={() => loginFacebookUser()}
              >
                <FaFacebook className="text-blue-600 text-xl" />
                <p className="">
                  Sign in through <span className="font-bold">facebook</span>
                </p>
              </button>

              <div className="flex w-2/3 mx-auto py-2 -mt-5 -mb-5 items-center">
                <div className="bg-gray-300 h-[1px] w-full"></div>
                <div className="p-2 -mt-1 text-gray-500">or</div>
                <div className="bg-gray-300 h-[1px] w-full"></div>
              </div>
              <button className="py-3 border border-gray-300 flex justify-center items-center gap-x-3 rounded-full text-black cursor-pointer">
                <img src={Logo} alt="website logo" className="h-[20px] w-[20px]" />
                <p className="">create new account</p>
              </button>
            </div>
          </div>
          {/* Right side lg */}
          <div className="w-1/2 relative flex justify-center items-center">
            <img src={PhoneImg} alt="phone img" className="w-2/3 rotate-6" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
