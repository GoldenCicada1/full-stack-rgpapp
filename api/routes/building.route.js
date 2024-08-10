import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import {
  getBuildings,
  getBuildingById,
  addBuilding,
  updateBuilding,
  // bulkUpdateBuildingsByLandId,
  deleteBuilding,
  deleteMultipleBuildings,
  hardDeleteBuildings,
  // bulkUpdateBuildings,
} from "../controllers/building.controller.js";

const router = express.Router();

// Building Routes
router.get("/", getBuildings);
router.get("/:id", getBuildingById);
router.post("/", verifyToken, verifyAdmin, addBuilding);
router.put("/:id", verifyToken, verifyAdmin, updateBuilding);
// router.put("/bulk", verifyToken, verifyAdmin, bulkUpdateBuildings);
// router.put("/bulkByLand", verifyToken, verifyAdmin, bulkUpdateBuildingsByLandId);
router.delete("/:id", verifyToken, verifyAdmin, deleteBuilding);
router.delete("/", verifyToken, verifyAdmin, deleteMultipleBuildings);
router.delete("/hard/:id", verifyToken, verifyAdmin, hardDeleteBuildings);

export default router;
