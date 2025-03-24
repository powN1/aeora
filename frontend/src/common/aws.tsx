import axios from "axios";
import { toast } from "react-toastify";

const uploadImage = async (img, uploadUrl: string) => {
  let imgUrl = null;

  try {
    await axios({
      method: "PUT",
      url: uploadUrl,
      headers: { "Content-Type": "multipart/form-data" },
      data: img,
    });

    imgUrl = uploadUrl.split("?")[0];
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Uploading image failed");
  }
  return imgUrl;
};

export default uploadImage;
