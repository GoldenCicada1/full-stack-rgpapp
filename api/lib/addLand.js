import validator from "validator";
import prisma from "./prisma.js"; // Import Prisma client
import logger from "../lib/logger.js"; // Import the logger
import { generateSequentialId } from "../lib/idGenerator.js"; // Import the ID generator function
import { processLocationData } from "../lib/addLocation.js"; // Adjust the import path as needed

export const processLandData = async (landData, tx) => {
  if (!landData) {
    throw new Error("Missing landData");
  }

  let finalLandId;
  let landExists = false; // To indicate if the land already exists

  try {
    const {
      customId, // Provided land ID (custom ID)
      landName,
      landSize,
      landDescription,
      landFeatures,
      landZoning,
      landSoilStructure,
      landTopography,
      landPostalZipCode,
      landRegistered,
      landRegistrationDate,
      landAccessibility,
      locationData,
    } = landData;

    // Task 1: Check If customId is provided, fetch the existing land
    if (customId) {
      const sanitizedCustomId = validator.escape(customId);

      const land = await tx.land.findUnique({
        where: { customId: sanitizedCustomId },
        include: { location: true }, // Include location details
      });

      if (land) {
        finalLandId = land.id;
        landExists = true;

        // If locationData is not provided, use the location from the existing land record
        if (!locationData) {
          if (land.location) {
            landData.locationData = { ...land.location };
          } else {
            throw new Error("Location data is missing for the existing land.");
          }
        }
      } else {
        throw new Error("Land with the provided custom ID does not exist");
      }
    } else {
      // Task 2: Create new land if no landId provided or landId not found

      // Sanitize input fields
      const sanitizedLandName = validator.escape(landName);
      const sanitizedLandSize = Number(landSize); // Convert to number directly
      const sanitizedLandDescription = validator.escape(landDescription);
      const sanitizedLandFeatures = Array.isArray(landFeatures)
        ? landFeatures.map((f) => validator.escape(f))
        : [];
      const sanitizedLandZoning = validator.escape(landZoning || "");
      const sanitizedLandSoilStructure = validator.escape(
        landSoilStructure || ""
      );
      const sanitizedLandTopography = validator.escape(landTopography || "");
      const sanitizedLandPostalZipCode = validator.escape(
        landPostalZipCode || ""
      );
      const sanitizedLandAccessibility = validator.escape(
        landAccessibility || ""
      );

      // Ensure required fields are provided
      if (
        !sanitizedLandName ||
        !sanitizedLandSize ||
        !sanitizedLandDescription ||
        !locationData
      ) {
        throw new Error(
          "name, size, description, and locationData are required fields"
        );
      }

      // Process location data
      const { finalLocationId } = await processLocationData(locationData, tx);
      console.log("Final Location ID:", finalLocationId);

      // Check if the land already exists
      let land = await tx.land.findFirst({
        where: {
          name: sanitizedLandName,
          locationId: finalLocationId,
        },
      });

      if (land) {
        landExists = true;
        finalLandId = land.id;
      } else {
        // Generate a custom ID
        const customId = await generateSequentialId();

        // Create new land
        land = await tx.land.create({
          data: {
            customId,
            name: sanitizedLandName,
            size: sanitizedLandSize,
            description: sanitizedLandDescription,
            features: sanitizedLandFeatures,
            zoning: sanitizedLandZoning,
            soilStructure: sanitizedLandSoilStructure,
            topography: sanitizedLandTopography,
            postalZipCode: sanitizedLandPostalZipCode,
            registered: landRegistered || false,
            registrationDate: landRegistrationDate
              ? new Date(landRegistrationDate)
              : null,
            accessibility: sanitizedLandAccessibility,
            locationId: finalLocationId,
          },
        });

        finalLandId = land.id;
      }
    }

    return { finalLandId, landExists };
  } catch (error) {
    logger.error("Error processing land data:", error);
    throw new Error("Failed to process land data: " + error.message);
  }
};
