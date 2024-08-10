import validator from "validator";
import prisma from "./prisma.js"; // Import Prisma client
import logger from "../lib/logger.js"; // Import the logger
import { processLandData } from "../lib/addLand.js"; // Adjust the import path as needed
import { generateBuildingCustomId } from "../lib/idGenerator.js"; // Adjust the import path as needed

export const processBuildingData = async (buildingData, tx) => {
  if (!buildingData) {
    throw new Error("Missing Building Data");
  }

  let finalBuildingId;
  let buildingExists = false; // To indicate if the building already exists
  try {
    const {
      customId, // Provided Building ID (Custom ID)
      buildingNumberOfFloors,
      buildingYearBuilt,
      buildingName,
      buildingType,
      buildingSize,
      buildingDescription,
      buildingFeatures,
      buildingTotalBedrooms,
      buildingTotalBathrooms,
      buildingParkingSpaces,
      buildingAmenities,
      buildingUtilities,
      buildingMaintenanceCost,
      buildingManagementCompany,
      buildingConstructionMaterial,
      buildingArchitect,
      buildingUses,
      buildingYearUpgraded,
      landData,
    } = buildingData;

    //Task 1: Check If customId is provided, fetch the existing Building
    if (customId) {
      const sanitizedCustomId = validator.escape(customId);
      const building = await tx.building.findUnique({
        where: { customId: sanitizedCustomId },
        include: { land: true }, // Include land details
      });

      if (building) {
        finalBuildingId = building.id;
        buildingExists = true;

        // If LandData is not provided, use the Land from the existing Building record
        if (!landData) {
          if (building.land) {
            buildingData.landData = { ...building.land };
          } else {
            throw new Error("Land data is missing for the existing Building.");
          }
        }
      } else {
        throw new Error("Building with the provided custom ID does not exist");
      }
    } else {
      // Task 2: Create new Building if no buildingId provided or buildingId not found

      // Ensure numberOfFloors is converted to number
      const numberOfFloorsValue =
        typeof buildingNumberOfFloors === "string"
          ? parseInt(buildingNumberOfFloors, 10)
          : buildingNumberOfFloors;

      // Sanitize input fields
      const sanitizedNumberOfFloors = Number.isInteger(numberOfFloorsValue)
        ? numberOfFloorsValue
        : null;
      const sanitizedYearBuilt = buildingYearBuilt || null;
      const sanitizedName = validator.escape(buildingName || "");
      const sanitizedType = buildingType || null;
      const sanitizedSize = buildingSize || null;
      const sanitizedDescription = validator.escape(buildingDescription || "");
      const sanitizedFeatures = Array.isArray(buildingFeatures)
        ? buildingFeatures.map((f) => validator.escape(f))
        : [];
      const sanitizedTotalBedrooms = buildingTotalBedrooms || null;
      const sanitizedTotalBathrooms = buildingTotalBathrooms || null;
      const sanitizedParkingSpaces = buildingParkingSpaces || null;
      const sanitizedAmenities = Array.isArray(buildingAmenities)
        ? buildingAmenities.map((a) => validator.escape(a))
        : [];
      const sanitizedUtilities = buildingUtilities || null;
      const sanitizedMaintenanceCost = buildingMaintenanceCost || null;
      const sanitizedManagementCompany = buildingManagementCompany || null;
      const sanitizedConstructionMaterial =
        buildingConstructionMaterial || null;
      const sanitizedArchitect = buildingArchitect || null;
      const sanitizedUses = buildingUses || null;
      const sanitizedYearUpgraded = buildingYearUpgraded || null;

      // Ensure required fields are provided
      if (
        !sanitizedName ||
        !sanitizedSize ||
        !sanitizedTotalBathrooms ||
        !sanitizedTotalBedrooms ||
        !sanitizedNumberOfFloors ||
        !sanitizedAmenities ||
        !sanitizedDescription ||
        !sanitizedFeatures ||
        !landData
      ) {
        throw new Error(
          "Name, Size Total Bath Rooms, Total Bed Rooms, Number of Floors, Amenities, Description, Features and Land Data  are required Fields"
        );
      }
      // Process land data
      const { finalLandId } = await processLandData(landData, tx);
      console.log("Final Land ID:", finalLandId);

      // Check if the Building already exists
      let building = await tx.building.findFirst({
        where: {
          name: sanitizedName,
          landId: finalLandId,
        },
      });

      if (building) {
        buildingExists = true;
        finalBuildingId = building.id;
      } else {
        // Generate a custom ID
        const customId = await generateBuildingCustomId();

        // Create new building
        building = await tx.building.create({
          data: {
            customId,
            numberOfFloors: sanitizedNumberOfFloors,
            yearBuilt: sanitizedYearBuilt,
            name: sanitizedName,
            type: sanitizedType,
            size: sanitizedSize,
            description: sanitizedDescription,
            features: sanitizedFeatures,
            totalBedrooms: sanitizedTotalBedrooms,
            totalBathrooms: sanitizedTotalBathrooms,
            parkingSpaces: sanitizedParkingSpaces,
            amenities: sanitizedAmenities,
            utilities: sanitizedUtilities,
            maintenanceCost: sanitizedMaintenanceCost,
            managementCompany: sanitizedManagementCompany,
            constructionMaterial: sanitizedConstructionMaterial,
            architect: sanitizedArchitect,
            uses: sanitizedUses,
            yearUpgraded: sanitizedYearUpgraded,
            landId: finalLandId,
          },
        });

        finalBuildingId = building.id;
      }
    }

    return { finalBuildingId, buildingExists };
  } catch (error) {
    logger.error("Error processing Building data:", error);
    throw new Error("Failed to process building data: " + error.message);
  }
};
