// lib/idGenerator.js

import { PrismaClient } from "@prisma/client"; // Ensure Prisma client is imported
const prisma = new PrismaClient();

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const length = 6;

const generateRandomId = () => {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  console.log("Generated ID:", id); // Log the generated ID
  console.log("ID Length:", id.length); // Log the length of the ID

  return id;
};

export const generateSequentialId = async () => {
  let id;
  let isUnique = false;

  while (!isUnique) {
    id = generateRandomId();
    // Check if the ID already exists in the Land collection
    const existingLand = await prisma.land.findUnique({
      where: {  customId: id },
    });

    if (!existingLand) {
      // ID is unique
      isUnique = true;
    }
  }

  return id;
};


