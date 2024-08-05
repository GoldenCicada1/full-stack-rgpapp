import validator from "validator";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import logger from "../lib/logger.js"; // Import the logger
import { generateSequentialId } from "../lib/idGenerator.js"; // Import the ID generator function
import { processLocationData } from "../lib/addLocation.js"; // Import the location processing function
import { Prisma } from "@prisma/client"; // Import Prisma errors
import { updateLocationData } from "../lib/updateLocationData.js"; // Adjust the path as necessary

// Land Management Start
export const getLands = async (req, res) => {
  try {
    const lands = await prisma.land.findMany({
      include: {
        location: true, // Include location details
      },
    });

    res.status(200).json(lands);
  } catch (err) {
    console.error("Error fetching lands: ", err);
    res.status(500).json({ message: "Failed to get lands" });
  }
};
export const getLandById = async (req, res) => {
  const { id } = req.params;

  try {
    const land = await prisma.land.findUnique({
      where: {
        id,
      },
      include: {
        location: true, // Use lowercase 'location' as defined in your Prisma schema
      },
    });

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    res.status(200).json(land);
  } catch (error) {
    console.error("Error fetching land by ID:", error);
    res.status(500).json({ message: "Failed to fetch land" });
  }
};
export const addLand = async (req, res) => {
  const {
    name,
    size,
    description,
    features,
    zoning,
    soilStructure,
    topography,
    postalZipCode,
    registered,
    registrationDate,
    accessibility,
    locationData,
  } = req.body;

  // Input sanitization
  const sanitizedName = validator.escape(name);
  const sanitizedDescription = validator.escape(description);
  const sanitizedSize = Number(size); // Convert to number directly
  const sanitizedFeatures = Array.isArray(features)
    ? features.map((f) => validator.escape(f))
    : [];
  const sanitizedZoning = validator.escape(zoning || "");
  const sanitizedSoilStructure = validator.escape(soilStructure || "");
  const sanitizedTopography = validator.escape(topography || "");
  const sanitizedPostalZipCode = validator.escape(postalZipCode || "");
  const sanitizedAccessibility = validator.escape(accessibility || "");

  // Validate required fields for land
  if (
    !sanitizedName ||
    !sanitizedSize ||
    !sanitizedDescription ||
    !locationData
  ) {
    return res.status(400).json({
      message: "name, size, description, and locationData are required fields",
    });
  }

  try {
    // Use Prisma transaction to ensure atomic operations
    const newLand = await prisma.$transaction(async (prisma) => {
      // Process location data
      const { finalLocationId, locationExists } = await processLocationData(
        locationData,
        prisma
      );

      // Check if land already exists
      const existingLand = await prisma.land.findFirst({
        where: {
          name: sanitizedName,
          locationId: finalLocationId,
        },
      });

      if (existingLand) {
        throw new Error("Land with the same name and location already exists");
      }

      // Generate a unique ID for the new land entry
      const customId = await generateSequentialId();

      // Create the land
      const createdLand = await prisma.land.create({
        data: {
          name: sanitizedName,
          size: sanitizedSize,
          description: sanitizedDescription,
          features: sanitizedFeatures,
          zoning: sanitizedZoning,
          soilStructure: sanitizedSoilStructure,
          topography: sanitizedTopography,
          postalZipCode: sanitizedPostalZipCode,
          registered: registered || false,
          registrationDate: registrationDate
            ? new Date(registrationDate)
            : null,
          accessibility: sanitizedAccessibility,
          locationId: finalLocationId,
          customId: customId,
        },
        include: {
          location: true,
        },
      });

      // Return createdLand and locationExists from the transaction
      return { createdLand, locationExists };
    });

    // Respond with different messages based on whether the location was new or existing
    if (newLand.locationExists) {
      res.status(200).json({
        message: "Land added successfully. The location already existed.",
        data: newLand.createdLand,
      });
    } else {
      res.status(201).json({
        message: "Land added successfully. A new location was created.",
        data: newLand.createdLand,
      });
    }
  } catch (error) {
    // Log the error
    logger.error("Error adding land:", error);

    // Respond to the client with a custom error message
    if (
      error.message === "Land with the same name and location already exists"
    ) {
      res.status(409).json({
        message: "Land with the same name and location already exists",
      });
    } else if (error.message.includes("Location")) {
      res.status(409).json({
        message: "The location already exists",
      });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({
        message: "Failed to add land due to a database request error",
        details: error.message,
      });
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      res.status(500).json({
        message: "Failed to add land due to an unknown database error",
        details: error.message,
      });
    } else {
      res.status(500).json({
        message: "Failed to add land due to an internal server error",
        details: error.message,
      });
    }
  }
};
export const updateLand = async (req, res) => {
  const landId = req.params.id; // Assuming the landId is passed as a route parameter
  const {
    name,
    size,
    description,
    features,
    zoning,
    soilStructure,
    topography,
    postalZipCode,
    registered,
    registrationDate,
    accessibility,
    locationData,
  } = req.body;

  // Validate and sanitize land data
  const sanitizedName = validator.escape(name);
  const sanitizedSize = Number(size); // Convert to number directly
  const sanitizedDescription = validator.escape(description);
  const sanitizedFeatures = Array.isArray(features)
    ? features.map((f) => validator.escape(f))
    : [];
  const sanitizedZoning = validator.escape(zoning || "");
  const sanitizedSoilStructure = validator.escape(soilStructure || "");
  const sanitizedTopography = validator.escape(topography || "");
  const sanitizedPostalZipCode = validator.escape(postalZipCode || "");
  const sanitizedRegistered = registered || false;
  const sanitizedRegistrationDate = registrationDate
    ? new Date(registrationDate)
    : null;
  const sanitizedAccessibility = validator.escape(accessibility || "");

  // Validate required fields for land
  if (
    !sanitizedName ||
    !sanitizedSize ||
    !sanitizedDescription ||
    !locationData
  ) {
    return res.status(400).json({
      message: "name, size, description, and locationData are required fields",
    });
  }

  // Use Prisma transaction for atomic operations
  try {
    const result = await prisma.$transaction(async (tx) => {
       // Determine if landId is a custom ID or ObjectID
       let existingLand;
       if (/^[A-Za-z0-9]+$/.test(landId)) {
         // Custom ID pattern check
         existingLand = await tx.land.findUnique({
           where: { customId: landId }, // Assuming you have a customId field
           include: { location: true },
         });
       } else {
         // ObjectID pattern check
         existingLand = await tx.land.findUnique({
           where: { id: landId }, // Use default Prisma ObjectID field
           include: { location: true },
         });
       }

      if (!existingLand) {
        throw new Error("Land not found");
      }

      const existingLocation = existingLand.location;

      // Process and update the location data
      await updateLocationData(existingLocation, locationData, tx);

      // Check for changes in the land data
      const updatedLandData = {};
      if (sanitizedName !== existingLand.name)
        updatedLandData.name = sanitizedName;
      if (sanitizedSize !== existingLand.size)
        updatedLandData.size = sanitizedSize;
      if (sanitizedDescription !== existingLand.description)
        updatedLandData.description = sanitizedDescription;
      if (sanitizedFeatures !== existingLand.features)
        updatedLandData.features = sanitizedFeatures;
      if (sanitizedZoning !== existingLand.zoning)
        updatedLandData.zoning = sanitizedZoning;
      if (sanitizedSoilStructure !== existingLand.soilStructure)
        updatedLandData.soilStructure = sanitizedSoilStructure;
      if (sanitizedTopography !== existingLand.topography)
        updatedLandData.topography = sanitizedTopography;
      if (sanitizedPostalZipCode !== existingLand.postalZipCode)
        updatedLandData.postalZipCode = sanitizedPostalZipCode;
      if (sanitizedRegistered !== existingLand.registered)
        updatedLandData.registered = sanitizedRegistered;
      if (
        sanitizedRegistrationDate &&
        sanitizedRegistrationDate.toISOString() !==
          existingLand.registrationDate.toISOString()
      ) {
        updatedLandData.registrationDate = sanitizedRegistrationDate;
      }
      if (sanitizedAccessibility !== existingLand.accessibility)
        updatedLandData.accessibility = sanitizedAccessibility;

      // Add updatedAt timestamp if there are changes
      if (Object.keys(updatedLandData).length > 0) {
        updatedLandData.updatedAt = new Date();
      }

      // Update the land if there are changes
      let updatedLand = existingLand; // Initialize with existingLand to handle the case where there are no changes
      if (Object.keys(updatedLandData).length > 0) {
        updatedLand = await tx.land.update({
          where: { id: existingLand.id },  // Use the correct ID field
          data: updatedLandData,
          include: { location: true }, // Include location details in the response
        });
      }

      return updatedLand;
    });

    res.status(200).json(result);
  } catch (error) {
    // Log the error
    logger.error("Error updating land:", error);

    // Respond to the client with a custom error message
    res.status(500).json({ message: "Failed to update land" });
  }
};

export const deleteLand = async (req, res) => {
  const landId = req.params.id; // Assuming the landId is passed as a route parameter

  try {
    // Find the land by id to get the associated locationId
    const land = await prisma.land.findUnique({
      where: { id: landId },
      select: { locationId: true },
    });

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    const locationId = land.locationId;

    // Delete the land entry
    await prisma.land.delete({
      where: { id: landId },
    });

    // Delete the location entry associated with the land
    await prisma.location.delete({
      where: { id: locationId },
    });

    res
      .status(200)
      .json({ message: "Land and associated location deleted successfully" });
  } catch (error) {
    console.error("Error deleting land and location:", error);
    res.status(500).json({ message: "Failed to delete land and location" });
  }
};

export const deleteMultipleLands = async (req, res) => {
  const { landIds } = req.body; // Assuming the landIds are passed in the request body

  if (!landIds || !Array.isArray(landIds) || landIds.length === 0) {
    return res
      .status(400)
      .json({ message: "landIds is required and should be a non-empty array" });
  }

  try {
    // Find the locations associated with the landIds
    const lands = await prisma.land.findMany({
      where: {
        id: {
          in: landIds,
        },
      },
      select: {
        id: true,
        locationId: true,
      },
    });

    if (lands.length === 0) {
      return res
        .status(404)
        .json({ message: "No land entries found for the provided IDs" });
    }

    const locationIds = lands.map((land) => land.locationId);

    // Delete the land entries
    await prisma.land.deleteMany({
      where: {
        id: {
          in: landIds,
        },
      },
    });

    // Delete the location entries
    await prisma.location.deleteMany({
      where: {
        id: {
          in: locationIds,
        },
      },
    });

    res.status(200).json({
      message: "Lands and their associated locations deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lands and locations:", error);
    res.status(500).json({ message: "Failed to delete lands and locations" });
  }
};

// Land Management End
