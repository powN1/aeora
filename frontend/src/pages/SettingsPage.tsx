import { ToastContainer } from "react-toastify";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import uploadImage from "../common/aws";
import defaultUserImg from "../assets/defaultUser.svg";
import { changeProfilePicture } from "../services/authService";

export const SettingsPage = () => {
  const { userAuth, setUserAuth } = useAuth();

  const pictureInputRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleButtonClick = () => {
    if (pictureInputRef.current) {
      pictureInputRef.current.click();
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const img = e.target.files[0];

    const fileSizeLimit = 2 * 1024 * 1024; // 2MB in bytes
    if (img.size > fileSizeLimit) {
      toast.error("File size exceeds 2MB limit");
      return;
    }
    if (img) {
      const loadingToast = toast.loading("Uploading...");
      try {
        // Get a link for S3 file upload
        const response = await axios.post(
          `${BASE_URL}/api/get-upload-url`,
          { userId: userAuth.id },
          {
            headers: { Authorization: `${userAuth.accessToken}` },
          }
        );

        if (response.data.url) {
          // If S3 link has been provided then upload it to S3
          const url = response.data.url;
          const uploadedPictureUrl = await uploadImage(img, url);

          if (uploadedPictureUrl) {
            // If file has been successfully uploaded to S3 then change profile picture in DB
            const changeProfilePictureRes = await changeProfilePicture(uploadedPictureUrl, userAuth, setUserAuth);
            if (changeProfilePictureRes) {
              // If all actions are successful inform the user and change profile picture
              // console.log(changeProfilePictureRes);
              toast.dismiss(loadingToast);
              toast.success("Uploaded");
            }
          }
        }
      } catch (err: any) {
        // toast.error(err.response?.data?.message || "Uploading a picture failed");
        throw err;
      }
    }
  };
  return (
    <>
      <main className="h-screen flex flex-col lg:flex-row">
        <ToastContainer position="top-center" />
        <Navbar />

        <div className="w-24/25 flex flex-col justify-center items-center gap-y-10 px-4 max-lg:pt-16">
          <div className="rounded-full h-40 w-40">
            <img
              src={userAuth.profileImg ? userAuth.profileImg : defaultUserImg}
              alt="user picture"
              className="w-full h-full rounded-full flex justify-center items-center object-cover"
            />
          </div>

          <button
            className="w-full md:w-1/2 lg:w-1/5 py-2 rounded-full bg-aeora hover:bg-aeora-300 text-lg text-white font-bold cursor-pointer"
            onClick={handleButtonClick}
          >
            Change profile picture
          </button>

          <input
            id="uploadPicture"
            ref={pictureInputRef}
            type="file"
            accept=".png, .jpg, .jpeg"
            hidden
            onChange={handleProfilePictureUpload}
          />
        </div>
      </main>
    </>
  );
};
