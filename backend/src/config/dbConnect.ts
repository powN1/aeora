import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const dbConnect = async (): Promise<void> => {
  const dbUri = process.env.DB_LOCATION;
  if (!dbUri) {
    console.error("DB_LOCATION environment variable is missing!");
    process.exit(1); // Exit immediately if no URI
  }

  try {
    await mongoose.connect(dbUri);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit container on DB failure
  }
};

export default dbConnect;
