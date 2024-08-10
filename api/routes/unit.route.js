import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import {
  getUnits,
  getUnitById,
  addUnit,
  updateUnit,
  deleteUnit,
  deleteMultipleUnits,
  hardDeleteUnits
} from "../controllers/unit.controller.js";

const router = express.Router();

// Unit Routes
router.get("/", getUnits);
router.get("/:id", getUnitById);
router.post("/", verifyToken, verifyAdmin, addUnit);
router.put("/:id", verifyToken, verifyAdmin, updateUnit);
router.delete("/:id", verifyToken, verifyAdmin, deleteUnit);
router.delete("/", verifyToken, verifyAdmin, deleteMultipleUnits);
router.delete("/hard/:id", verifyToken, verifyAdmin, hardDeleteUnits);

export default router;
