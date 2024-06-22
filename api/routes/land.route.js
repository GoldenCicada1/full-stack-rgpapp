import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import {
  getLands,
  getLandById,
  addLand,
  updateLand,
  deleteLand,
  deleteMultipleLands,
} from "../controllers/land.controller.js";

const router = express.Router();

// Land Routes
router.get("/", getLands);
router.get("/:id", getLandById);
router.post("/", verifyToken, verifyAdmin, addLand);
router.put("/:id", verifyToken, verifyAdmin, updateLand);
router.delete("/:id", verifyToken, verifyAdmin, deleteLand);
router.delete("/", verifyToken, verifyAdmin, deleteMultipleLands);

export default router;
