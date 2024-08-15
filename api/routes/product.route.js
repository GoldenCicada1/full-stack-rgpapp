import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
// import { verifyAdmin } from "../middleware/verifyAdmin.js";
import { authenticateToken } from "../middleware/admin.auth.middleware.js";
import {
  addProductLand,
  getProductLandById,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

// Product Routes

//Product Land Start//
router.post("/land", authenticateToken, addProductLand);
router.get("/land/:id", authenticateToken, getProductLandById);
//Product Land End//

router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", verifyToken, authenticateToken, updateProduct);
router.delete("/:id", verifyToken, authenticateToken, deleteProduct);

export default router;
