import { PrismaClient } from "@prisma/client"; // Ensure you import your Prisma client instance

const prisma = new PrismaClient();

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = req.user; // Use the user object attached by verifyToken

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not Authorized! Only admins can add posts." });
    }

    next();
  } catch (err) {
    console.error("Error in verifyAdmin middleware:", err);
    res.status(500).json({ message: "Server error" });
  }
};
