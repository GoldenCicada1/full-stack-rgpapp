import validator from "validator";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import logger from "../lib/logger.js"; // Import the logger
import { generateSequentialId } from "../lib/idGenerator.js"; // Import the ID generator function
import { processLocationData } from "../lib/addLocation.js"; // Import the location processing function
import { Prisma } from "@prisma/client"; // Import Prisma errors

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

      // Return createdLand from the transaction
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

  // Validate required fields for land
  if (!name || !size || !description || !locationData) {
    return res.status(400).json({
      message: "name, size, description, and locationData are required fields",
    });
  }

  try {
    // Fetch the existing land and its location
    const existingLand = await prisma.land.findUnique({
      where: { id: landId },
      include: { location: true },
    });

    if (!existingLand) {
      return res.status(404).json({ message: "Land not found" });
    }

    const existingLocation = existingLand.location;
    const {
      country,
      stateRegion,
      districtCounty,
      ward,
      streetVillage,
      latitude,
      longitude,
    } = locationData;

    // Validate required fields for location
    if (!country || !latitude || !longitude) {
      return res.status(400).json({
        message: "Location data must include country, latitude, and longitude",
      });
    }

    // Check for changes in the location data
    const updatedLocationData = {};
    if (country !== existingLocation.country)
      updatedLocationData.country = country;
    if (stateRegion !== existingLocation.stateRegion)
      updatedLocationData.stateRegion = stateRegion;
    if (districtCounty !== existingLocation.districtCounty)
      updatedLocationData.districtCounty = districtCounty;
    if (ward !== existingLocation.ward) updatedLocationData.ward = ward;
    if (streetVillage !== existingLocation.streetVillage)
      updatedLocationData.streetVillage = streetVillage;
    if (latitude !== existingLocation.latitude)
      updatedLocationData.latitude = latitude;
    if (longitude !== existingLocation.longitude)
      updatedLocationData.longitude = longitude;

    // Update the location if there are changes
    if (Object.keys(updatedLocationData).length > 0) {
      updatedLocationData.updatedAt = new Date();
      await prisma.location.update({
        where: { id: existingLocation.id },
        data: updatedLocationData,
      });
    }

    // Check for changes in the land data
    const updatedLandData = {};
    if (name !== existingLand.name) updatedLandData.name = name;
    if (size !== existingLand.size) updatedLandData.size = size;
    if (description !== existingLand.description)
      updatedLandData.description = description;
    if (features !== existingLand.features) updatedLandData.features = features;
    if (zoning !== existingLand.zoning) updatedLandData.zoning = zoning;
    if (soilStructure !== existingLand.soilStructure)
      updatedLandData.soilStructure = soilStructure;
    if (topography !== existingLand.topography)
      updatedLandData.topography = topography;
    if (postalZipCode !== existingLand.postalZipCode)
      updatedLandData.postalZipCode = postalZipCode;
    if (registered !== existingLand.registered)
      updatedLandData.registered = registered;
    if (
      registrationDate &&
      new Date(registrationDate).toISOString() !==
        existingLand.registrationDate.toISOString()
    ) {
      updatedLandData.registrationDate = new Date(registrationDate);
    }
    if (accessibility !== existingLand.accessibility)
      updatedLandData.accessibility = accessibility;

    // Add updatedAt timestamp if there are changes
    if (Object.keys(updatedLandData).length > 0) {
      updatedLandData.updatedAt = new Date();
    }

    // Update the land if there are changes
    let updatedLand;
    if (Object.keys(updatedLandData).length > 0) {
      updatedLand = await prisma.land.update({
        where: { id: landId },
        data: updatedLandData,
        include: { location: true }, // Include location details in the response
      });
    } else {
      updatedLand = existingLand;
    }

    res.status(200).json(updatedLand);
  } catch (error) {
    console.error("Error updating land:", error);
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
