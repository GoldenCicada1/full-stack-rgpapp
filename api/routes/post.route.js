import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import { verifyAdmin     } from "../middleware/verifyAdmin.js";
import { addPost, deletePost, getPost, getPosts, updatePost } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", verifyToken, verifyAdmin, addPost); // Apply verifyAdmin middleware
router.put("/:id", verifyToken, verifyAdmin, updatePost);
router.delete("/:id", verifyToken, verifyAdmin, deletePost);


export default router;
