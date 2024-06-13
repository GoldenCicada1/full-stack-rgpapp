export const verifyAdmin = async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Not Authorized! Only admins can add posts." });
  }

  next();
};
