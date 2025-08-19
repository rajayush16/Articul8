import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("MongoDB connected");
    }
    catch{
        console.log("MongoDB connection failed");
        process.exit(1);
    }
};

export default connectDB;