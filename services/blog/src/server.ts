import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js"
import {createClient} from "redis"
import cors from "cors";
import { startCacheConsumer } from "./utils/consumer.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

startCacheConsumer();
const port = process.env.PORT;

export const redisClient = createClient({
  url: process.env.REDIS_URL as string
});

redisClient.connect().then(() => console.log("Redis Client Connected")).catch((error) => console.log("Error: ",error));

app.use("/api/v1", blogRoutes)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});