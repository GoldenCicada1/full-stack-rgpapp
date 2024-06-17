import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ message: "Token is not Valid!" });
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }


      req.user = user; // Attach the user object to the request
      req.userId = user.id; // Also attach userId to the request
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};
