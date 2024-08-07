import validator from "validator";
import prisma from "./prisma.js"; // Import Prisma client
import logger from "../lib/logger.js"; // Import the logger
import { generateSequentialId } from "../lib/idGenerator.js"; // Import the ID generator function
import { processLocationData } from "../lib/addLocation.js"; // Adjust the import path as needed

export const processLandData = async (landData) => {
  console.log("Land Data:", landData);

  if (!landData.locationData) {
    throw new Error("Missing locationData in landData");
  }
  console.log("Location Data:", landData.locationData);

  let finalLandId;
  let landExists = false; // To indicate if the land already exists

  try {
    const {
      landId, // Provided land ID (custom ID)
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
    const { finalLocationId } = await processLocationData(locationData, prisma);
    console.log("Final Location ID:", finalLocationId);

    if (landId) {
      const sanitizedLandId = validator.escape(landId);

      const land = await prisma.land.findUnique({
        where: { customId: sanitizedLandId },
      });

      if (land) {
        finalLandId = land.id;
        landExists = true;
      } else {
        throw new Error("Land with the provided custom ID does not exist");
      }
    } else {
      let land = await prisma.land.findFirst({
        where: {
          name: sanitizedLandName,
          locationId: finalLocationId,
        },
      });

      if (land) {
        landExists = true;
        finalLandId = land.id;
      } else {
        const customId = await generateSequentialId();

        land = await prisma.land.create({
          data: {
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
            customId: customId,
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
