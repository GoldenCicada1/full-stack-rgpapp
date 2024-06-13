import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not Valid!" });
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};
