import aws from "aws-sdk";
import { nanoid } from "nanoid";
import axios from "axios";

// AWS S3 setup
const s3 = new aws.S3({
  region: "eu-central-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const generateUploadUrl = async (userId: string = "") => {
  let imageName = "";
  const date = new Date();

  // If it's a profile picture then put user id in the name
  // and overwrite any existing file that already has this name (previous profile pic)
  if (userId) {
    const params = { Bucket: process.env.AWS_BUCKET_NAME };
    const data = await s3.listObjects(params).promise();

    let existingProfilePictures = [];

    if (data) {
      existingProfilePictures = data.Contents.filter((file) => file.Key.includes(userId)).map((file) => ({
        Key: file.Key,
      }));
    }

    if (existingProfilePictures.length !== 0) {
      const params = { Bucket: process.env.AWS_BUCKET_NAME, Delete: { Objects: existingProfilePictures } };
      const response = await s3.deleteObjects(params).promise();
    }

    imageName = `profile_pictures/${userId}-${date.getTime()}.jpeg`;
  } else {
    imageName = `${nanoid()}-${date.getTime()}.jpeg`;
  }

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "aeora-messaging-app",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

export const uploadFileToAWSfromUrl = async (fileUrl: string, userId: string = "") => {
  try {
    const imageResponse = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });

    let imageName = "";
    const date = new Date();

    // If it's a profile picture then put user id in the name
    if (userId) {
      const params = { Bucket: process.env.AWS_BUCKET_NAME };
      const data = await s3.listObjects(params).promise();

      let existingProfilePictures = [];

      if (data) {
        existingProfilePictures = data.Contents.filter((file) => file.Key.includes(userId)).map((file) => ({
          Key: file.Key,
        }));
      }

      if (existingProfilePictures.length !== 0) {
        const params = { Bucket: process.env.AWS_BUCKET_NAME, Delete: { Objects: existingProfilePictures } };
        const response = await s3.deleteObjects(params).promise();
      }
      imageName = `profile_pictures/${userId}-${date.getTime()}.jpeg`;
    } else {
      imageName = `${nanoid()}-${date.getTime()}.jpeg`;
    }

    const uploadParams = {
      Bucket: "aeora-messaging-app",
      Key: imageName,
      Body: Buffer.from(imageResponse.data, "binary"),
      ContentType: "image/jpeg",
    };

    const s3Response = await s3.upload(uploadParams).promise();

    return s3Response.Location;
  } catch (err) {
    console.error("Error uploading file: ", err);
    throw new Error("Failed to upload file to S3");
  }
};
