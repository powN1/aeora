import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const dbConnect = (): void => {
  try {
    mongoose.connect(process.env.DB_LOCATION as string);
    console.log("Database Connected successfully");
  } catch (error) {
    console.log("Database Error");
  }
};

export default dbConnect;
