import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
  } from "../controllers/product.controller.js";

const router = express.Router();

// Product Routes
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/products", verifyToken, verifyAdmin, addProduct);
router.put("/products/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/products/:id", verifyToken, verifyAdmin, deleteProduct);

export default router;