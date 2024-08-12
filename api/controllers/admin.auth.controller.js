import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";


const JWT_SECRET = process.env.JWT_ADMIN_SECRET_KEY; // Secure this

// Register a new admin
export const register = async (req, res) => {
  const { email, username, password, avatar } = req.body;

  // Validation checks
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Email, username, and password are required" });
  }

  try {
    // Check if the admin already exists by username or email
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this username or email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin and save to DB
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        username,
        password: hashedPassword,
        isActive: true, // Default to true
        avatar // Optional field
      },
    });

    console.log;{"New Admin", newAdmin};

    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create admin" });
  }
};

// Login an admin
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the admin exists
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return res.status(400).json({ message: "Invalid Credentials" });

    // Check if the admin is active
    if (!admin.isActive)
      return res.status(403).json({ message: "Account is inactive" });

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: "7d" });

   // Send token in the response body
   res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to login" });
  }
};

// Logout an admin
export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout successful" });
};
