import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import adminAuthRoute from "./routes/admin.auth.route.js";
import postRoute from "./routes/post.route.js";
import locationRoute from "./routes/location.route.js";
import landRoute from "./routes/land.route.js";
import buildingRoute from "./routes/building.route.js";
import productRoute from "./routes/product.route.js";
import unitRoute from "./routes/unit.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import dotenv from "dotenv";
import { authenticateToken } from './middleware/admin.auth.middleware.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/admin/auth", adminAuthRoute);


app.use("/api/posts", postRoute);
app.use("/api/locations", authenticateToken, locationRoute);
app.use("/api/lands", authenticateToken, landRoute);
app.use("/api/buildings",  buildingRoute);
app.use("/api/products", authenticateToken, productRoute);
app.use("/api/units", authenticateToken, unitRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);



app.listen(8800, () => {
  console.log("Server is Running!");
});
