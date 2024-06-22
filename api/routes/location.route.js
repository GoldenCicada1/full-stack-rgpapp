import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import {
  getLocations,
  getLocationById,
  addLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/location.controller.js";

const router = express.Router();

// Location Routes
router.get("/", getLocations);
router.get("/:id", getLocationById);
router.post("/", verifyToken, verifyAdmin, addLocation);
router.put("/:id", verifyToken, verifyAdmin, updateLocation);
router.delete("/:id", verifyToken, verifyAdmin, deleteLocation);

export default router;
