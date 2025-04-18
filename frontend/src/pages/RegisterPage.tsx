import { useState } from "react";
import logoExtended from "../assets/logoExtended.svg";
import { Link } from "react-router-dom";
import { register } from "../services/authService";
import { ToastContainer, toast } from "react-toastify";
import { UserRegister } from "../utils/interface";
import { useAuth } from "../context/AuthContext";

// Regex for identifying whether the email and password are correctly formatted
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const RegisterPage: React.FC = () => {
  const { setUserAuth } = useAuth();

  const [firstNameInputValue, setFirstNameInputValue] = useState("");
  const [surnameInputValue, setSurnameInputValue] = useState("");
  const [emailInputValue, setEmailInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    switch (e.target.id) {
      case "firstName":
        setFirstNameInputValue(value);
        break;
      case "surname":
        setSurnameInputValue(value);
        break;
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

  const registerUser = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    // Error checking
    if (firstNameInputValue.length < 2) return toast.error("First name must be at least 2 letters long");
    if (surnameInputValue.length < 3) return toast.error("Surname must be at least 3 letters long");
    if (!emailInputValue.length) return toast.error("Enter email");
    if (!emailRegex.test(emailInputValue)) return toast.error("Email is invalid");
    if (!passwordRegex.test(passwordInputValue))
      return toast.error("Password should be 6-20 characters long with a numeric, 1 lowercase and 1 uppercase letters");

    const userData: UserRegister = {
      firstName: firstNameInputValue,
      surname: surnameInputValue,
      email: emailInputValue,
      password: passwordInputValue,
    };

    register(userData, setUserAuth);
  };

  return (
    <div className="bg-gray-100">
      <ToastContainer position="top-center" />
      <div className="h-screen lg:w-[60%] lg:px-0 mx-auto flex flex-col gap-y-8 overflow-hidden px-1">
        <Link to="/" className="w-34 lg:w-38 mt-8">
          <img src={logoExtended} alt="logo" className="w-full h-full object-cover" />
        </Link>
        <section className="flex">
          {/* Left side lg */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start gap-y-6">
            {/* { Login form } */}
            {/* Slogan */}
            <h1 className="text-4xl md:w-3/4 md:text-5xl lg:text-7xl text-center lg:text-start font-bold pb-3 text-aeora">
              Create new account
            </h1>
            <form onSubmit={registerUser} className="flex flex-col gap-y-4 w-full md:w-1/2 px-1">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="relative after:content-[''] after:w-full after:h-[1px] after:absolute after:bottom-0 after:left-0 after:bg-black after:hidden hover:after:block text-aeora font-bold"
                >
                  Login.
                </Link>
              </p>
              <div className="flex flex-col gap-y-2">
                <label htmlFor="firstName" className="text-sm font-bold">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={firstNameInputValue}
                  onChange={handleInputChange}
                  className="py-2 px-4 bg-gray-200/80 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label htmlFor="surname" className="text-sm font-bold">
                  Surname
                </label>
                <input
                  id="surname"
                  type="text"
                  placeholder="Surname"
                  value={surnameInputValue}
                  onChange={handleInputChange}
                  className="py-2 px-4 bg-gray-200 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label htmlFor="email" className="text-sm font-bold">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={emailInputValue}
                  onChange={handleInputChange}
                  className="py-2 px-4 bg-gray-200 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <label htmlFor="password" className="text-sm font-bold">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={passwordInputValue}
                  onChange={handleInputChange}
                  className="py-2 px-4 bg-gray-200 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="self-start px-10 py-2 rounded-full bg-aeora hover:bg-aeora-300 text-lg text-white font-bold cursor-pointer"
              >
                Create account
              </button>
            </form>
            {/* Login buttons */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
