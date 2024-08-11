import express from "express";
import { login, logout, register } from "../controllers/admin.auth.controller.js";
import { authenticateToken } from '../middleware/admin.auth.middleware.js';

const router = express.Router();

// Apply middleware to protect routes
router.get('/dashboard', authenticateToken, (req, res) => {
    res.send('Admin Dashboard');
  });

router.post('/register', register); // Admin registration
router.post('/login', login); // Admin login
router.post('/logout', logout); // Admin logout

export default router;
