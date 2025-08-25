import express from "express";
import dotenv from "dotenv"
import connectDB from "./utils/db.js";
import UserRoutes from "./routes/User.js"
import { v2 as cloudinary } from "cloudinary";
import cors from 'cors';

dotenv.config();

// Creating instance of express
const app = express();

// To allow json request from body
app.use(express.json());
// To allow cross origin requests
app.use(cors());


// Connecting to DB
connectDB()

// Cloudinary config
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key:process.env.CLOUDINARY_API_KEY as string,
    api_secret:process.env.CLOUDINARY_API_SECRET as string,
  });

// To allow json request from body
app.use(express.json());

app.use(cors());

// Mounting the routes
app.use("/api/v1",UserRoutes)

const port = process.env.PORT

// Running the server
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});