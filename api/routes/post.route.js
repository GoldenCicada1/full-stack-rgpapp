import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import {
  addPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/post.controller.js";
import {
  getProducts,
  getProductById,
  addProductLand,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  getLocations,
  getLocationById,
  addLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/location.controller.js";
import {
  getLands,
  getLandById,
  addLand,
  updateLand,
  deleteLand,
} from "../controllers/land.controller.js";
import {
  getBuildings,
  getBuildingById,
  addBuilding,
  updateBuilding,
  deleteBuilding,
} from "../controllers/building.controller.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", verifyToken, verifyAdmin, addPost); // Apply verifyAdmin middleware
router.put("/:id", verifyToken, verifyAdmin, updatePost);
router.delete("/:id", verifyToken, verifyAdmin, deletePost);

// Product Routes
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/products", verifyToken, verifyAdmin, addProductLand);
router.put("/products/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/products/:id", verifyToken, verifyAdmin, deleteProduct);

// Location Routes
router.get("/locations", getLocations);
router.get("/location/:id", getLocationById);
router.post("/location", verifyToken, verifyAdmin, addLocation);
router.put("/location/:id", verifyToken, verifyAdmin, updateLocation);
router.delete("/location/:id", verifyToken, verifyAdmin, deleteLocation);

// Land Routes
router.get("/lands", getLands);
router.get("/lands/:id", getLandById);
router.post("/lands", verifyToken, verifyAdmin, addLand);
router.put("/lands/:id", verifyToken, verifyAdmin, updateLand);
router.delete("/lands/:id", verifyToken, verifyAdmin, deleteLand);

// Building Routes
router.get("/buildings", getBuildings);
router.get("/buildings/:id", getBuildingById);
router.post("/buildings", verifyToken, verifyAdmin, addBuilding);
router.put("/buildings/:id", verifyToken, verifyAdmin, updateBuilding);
router.delete("/buildings/:id", verifyToken, verifyAdmin, deleteBuilding);

// Unit Routes
router.get("/buildings", getBuildings);
router.get("/buildings/:id", getBuildingById);
router.post("/buildings", verifyToken, verifyAdmin, addBuilding);
router.put("/buildings/:id", verifyToken, verifyAdmin, updateBuilding);
router.delete("/buildings/:id", verifyToken, verifyAdmin, deleteBuilding);


export default router;
