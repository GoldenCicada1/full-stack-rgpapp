import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // Initialize PrismaClient

const JWT_SECRET = process.env.JWT_ADMIN_SECRET_KEY;

// Middleware to authenticate token
export const authenticateToken = (req, res, next) => {
  // Extract token from cookies or Authorization header
  const token =
    req.cookies.token ||
    (req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1]);

  

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, async (err, payload) => {
    if (err) {
      
      return res.status(403).json({ message: "Invalid token" });
    }

    try {
      // Retrieve admin based on payload
      const admin = await prisma.admin.findUnique({
        where: { id: payload.id }, // Adjust this to match your admin ID field
      });

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      req.admin = admin; // Attach admin object to request
      req.adminId = admin.id; // Optionally attach adminId to request
     
      next();
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};
