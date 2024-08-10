// lib/idGenerator.js

import { PrismaClient } from "@prisma/client"; // Ensure Prisma client is imported
const prisma = new PrismaClient();

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const length = 6;
const sequentialNumberLength = 3;

const generateRandomId = () => {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  console.log("Generated ID:", id); // Log the generated ID
  console.log("ID Length:", id.length); // Log the length of the ID

  return id;
};

// Function to generate the next Random Custom Land ID
export const generateSequentialId = async () => {
  let id;
  let isUnique = false;

  while (!isUnique) {
    id = generateRandomId();
    // Check if the ID already exists in the Land collection
    const existingLand = await prisma.land.findUnique({
      where: { customId: id },
    });

    if (!existingLand) {
      // ID is unique
      isUnique = true;
    }
  }

  return id;
};

// Function to generate the next sequential building ID based on landId
export const generateBuildingCustomId = async (landId, tx) => {
  try {
    // Retrieve the land with the given landId to get its customId
    const land = await tx.land.findUnique({
      where: { id: landId },
      select: { customId: true },
    });

    if (!land || !land.customId) {
      throw new Error("Land not found or does not have a customId");
    }

    // Find the highest customId for buildings associated with this land's customId
    const lastBuilding = await tx.building.findFirst({
      where: {
        customId: {
          startsWith: land.customId,
        },
      },
      orderBy: {
        customId: "desc",
      },
      select: {
        customId: true,
      },
    });

    let nextNumber = 1; // Default to 001

    if (lastBuilding && lastBuilding.customId) {
      // Extract the sequential number from the last customId
      const lastNumber = parseInt(
        lastBuilding.customId.slice(land.customId.length),
        10
      );

      // Ensure that the parsed number is valid
      if (isNaN(lastNumber)) {
        throw new Error("Invalid number extracted from last customId");
      }

      nextNumber = lastNumber + 1;
    }

    if (nextNumber > 999) {
      throw new Error("No more available custom IDs for this land.");
    }

    // Format the next number as a 3-digit string
    const formattedNumber = nextNumber
      .toString()
      .padStart(sequentialNumberLength, "0");
    // Combine land.customId with the formatted number
    const customId = `${land.customId}${formattedNumber}`;

    console.log("custom id", customId);

    // Return the new custom ID
    return customId;
  } catch (error) {
    throw new Error(`Failed to generate custom ID: ${error.message}`);
  }
};

// Function to generate the next sequential Unit ID based on buildingId
export const generateUnitCustomId = async (buildingId, tx) => {
  try {
    // Retrieve the building with the given buildingId to get its customId
    const building = await tx.building.findUnique({
      where: { id: buildingId },
      select: { customId: true },
    });

    if (!building || !building.customId) {
      throw new Error("Building not found or does not have a customId");
    }

    // Find the highest customId for units associated with this building's customId
    const lastUnit = await tx.unit.findFirst({
      where: {
        customId: {
          startsWith: building.customId,
        },
      },
      orderBy: {
        customId: "desc",
      },
      select: {
        customId: true,
      },
    });

    let nextNumber = 1; // Default to 001

    if (lastUnit && lastUnit.customId) {
      // Extract the sequential number from the last customId
      const lastNumber = parseInt(
        lastUnit.customId.slice(building.customId.length),
        10
      );

      // Ensure that the parsed number is valid
      if (isNaN(lastNumber)) {
        throw new Error("Invalid number extracted from last customId");
      }

      nextNumber = lastNumber + 1;
    }

    if (nextNumber > 999) {
      throw new Error("No more available custom IDs for this building.");
    }

    // Format the next number as a 3-digit string
    const formattedNumber = nextNumber
      .toString()
      .padStart(sequentialNumberLength, "0");
    // Combine building.customId with the formatted number
    const customId = `${building.customId}${formattedNumber}`;

    console.log("custom id", customId);

    // Return the new custom ID
    return customId;
  } catch (error) {
    throw new Error(`Failed to generate custom ID: ${error.message}`);
  }
};
