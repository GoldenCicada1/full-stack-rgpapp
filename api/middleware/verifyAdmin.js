import { PrismaClient } from "@prisma/client"; // Ensure you import your Prisma client instance

const prisma = new PrismaClient();

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not Authorized! Only admins can add posts." });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
