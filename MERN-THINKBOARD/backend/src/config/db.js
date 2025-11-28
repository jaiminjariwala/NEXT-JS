import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // here we'll try connecting to our database
    // use mongoose to connect and pass connection string
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGO DB CONNECTED SUCCESSFULLY!");
  } catch (error) {
    console.log("❗️❗️ Error connecting to MONGO DB ❗️❗️", error);
    process.exit(1); // if you get some error, exit the process. 1 means exit with failure. 0 = success.
  }
};
