import validator from "validator";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import logger from "../lib/logger.js"; // Import the logger
import { processLandData } from "../lib/addLand.js"; // Adjust the import path as needed
import { generateBuildingCustomId } from "../lib/idGenerator.js"; // Adjust the import path as needed

// Building Management Start
export const getBuildings = async (req, res) => {
  const {
    numberOfFloors,
    yearBuilt,
    type,
    size,
    amenities,
    constructionMaterial,
    uses,
    yearUpgraded,
    country,
    stateRegion,
    districtCounty,
    ward,
  } = req.query;

  try {
    const buildings = await prisma.building.findMany({
      where: {
        numberOfFloors: numberOfFloors ? parseInt(numberOfFloors) : undefined,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
        type: type || undefined,
        size: size ? parseFloat(size) : undefined,
        amenities: amenities
          ? {
              has: amenities.split(","),
            }
          : undefined,
        constructionMaterial: constructionMaterial || undefined,
        uses: uses || undefined,
        yearUpgraded: yearUpgraded ? parseInt(yearUpgraded) : undefined,
        land: {
          location: {
            country: country || undefined,
            stateRegion: stateRegion || undefined,
            districtCounty: districtCounty || undefined,
            ward: ward || undefined,
          },
        },
      },
      include: {
        land: {
          include: {
            location: true, // Include location details in the response
          },
        },
      },
    });

    res.status(200).json(buildings);
  } catch (error) {
    console.error("Error fetching buildings:", error);
    res.status(500).json({ message: "Failed to get buildings" });
  }
};
export const getBuildingById = async (req, res) => {
  const buildingId = req.params.id; // Assuming the building ID is passed as a route parameter

  try {
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        land: {
          include: {
            location: true, // Include the location details of the associated land
          },
        },
      },
    });

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    res.status(200).json(building);
  } catch (error) {
    console.error("Error fetching building:", error);
    res.status(500).json({ message: "Failed to fetch building" });
  }
};
export const addBuilding = async (req, res) => {
  const {
    numberOfFloors,
    yearBuilt,
    name,
    type,
    size,
    description,
    features,
    totalBedrooms,
    totalBathrooms,
    parkingSpaces,
    amenities,
    utilities,
    maintenanceCost,
    managementCompany,
    constructionMaterial,
    architect,
    uses,
    yearUpgraded,
    landData,
  } = req.body;

  // Validate and sanitize required fields for landData
  if (!landData) {
    return res.status(400).json({
      message: "landData is required",
    });
  }

  const sanitizedLandData = {
    ...landData,
    landName: validator.escape(landData.landName || ""),
    landSize: landData.landSize ? Number(landData.landSize) : null, // Convert to number directly
    landDescription: validator.escape(landData.landDescription || ""),
    landFeatures: Array.isArray(landData.landFeatures)
      ? landData.landFeatures.map((f) => validator.escape(f))
      : [],
    landZoning: validator.escape(landData.landZoning || ""),
    landSoilStructure: validator.escape(landData.landSoilStructure || ""),
    landTopography: validator.escape(landData.landTopography || ""),
    landPostalZipCode: validator.escape(landData.landPostalZipCode || ""),
    landRegistered: Boolean(landData.landRegistered),
    landRegistrationDate: landData.landRegistrationDate
      ? new Date(landData.landRegistrationDate)
      : null,
    landAccessibility: validator.escape(landData.landAccessibility || ""),
  };

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Process land data within the transaction
      const { finalLandId, landExists } = await processLandData(
        sanitizedLandData,
        tx
      );

      if (!finalLandId) {
        throw new Error("Failed to get or create land.");
      }

      // Generate the custom ID for the building
      const customId = await generateBuildingCustomId(finalLandId, tx);
      console.log("Generated customId:", customId, "Type:", typeof customId); // Debug

      // Ensure numberOfFloors is converted to number
      const numberOfFloorsValue =
        typeof numberOfFloors === "string"
          ? parseInt(numberOfFloors, 10)
          : numberOfFloors;

      // Create the building using finalLandId and customId
      const newBuilding = await tx.building.create({
        data: {
          numberOfFloors: Number.isInteger(numberOfFloorsValue)
            ? numberOfFloorsValue
            : null,
          yearBuilt: yearBuilt || null,
          name: validator.escape(name),
          type: type || null,
          size: size || null,
          description: validator.escape(description),
          features: features ? features.map((f) => validator.escape(f)) : [],
          totalBedrooms: totalBedrooms || null,
          totalBathrooms: totalBathrooms || null,
          parkingSpaces: parkingSpaces || null,
          amenities: amenities ? amenities.map((a) => validator.escape(a)) : [],
          utilities: utilities || null,
          maintenanceCost: maintenanceCost || null,
          managementCompany: managementCompany || null,
          constructionMaterial: constructionMaterial || null,
          architect: architect || null,
          uses: uses || null,
          yearUpgraded: yearUpgraded || null,
          landId: finalLandId,
          customId: customId,
        },
        include: {
          land: {
            include: {
              location: true, // Include location details of the associated land
            },
          },
        },
      });

      return { newBuilding, landExists };
    });

    res.status(201).json({
      message: result.landExists
        ? "Building added successfully. The land already existed."
        : "Building added successfully. New land was created.",
      data: result.newBuilding,
    });
  } catch (error) {
    logger.error("Error adding building:", error);
    res
      .status(500)
      .json({ message: "Failed to add building: " + error.message });
  }
};
export const updateBuilding = async (req, res) => {
  const buildingId = req.params.id; // Assuming the building ID is passed as a route parameter

  const {
    numberOfFloors,
    yearBuilt,
    name,
    type,
    size,
    description,
    totalBathrooms,
    totalBedrooms,
    parkingSpaces,
    amenities,
    utilities,
    maintenanceCost,
    managementCompany,
    constructionMaterial,
    architect,
    uses,
    yearUpgraded,
    locationData,
    landData,
  } = req.body;

  // Validate required fields for building update
  if (
    !numberOfFloors ||
    !name ||
    !size ||
    !description ||
    !locationData ||
    !landData
  ) {
    return res.status(400).json({
      message:
        "numberOfFloors, name, size, description, locationData, and landData are required fields",
    });
  }

  try {
    // Validate required fields for location
    const {
      country,
      stateRegion,
      districtCounty,
      ward,
      streetVillage,
      latitude,
      longitude,
    } = locationData;

    if (!country || !latitude || !longitude) {
      return res.status(400).json({
        message: "Location data must include country, latitude, and longitude",
      });
    }

    // Fetch existing building
    const existingBuilding = await prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        land: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!existingBuilding) {
      return res.status(404).json({ message: "Building not found" });
    }

    const existingLand = existingBuilding.land;
    const existingLocation = existingLand.location;

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
    if (landData.landName !== existingLand.name)
      updatedLandData.name = landData.landName;
    if (landData.landSize !== existingLand.size)
      updatedLandData.size = landData.landSize;
    if (landData.landDescription !== existingLand.description)
      updatedLandData.description = landData.landDescription;
    if (landData.landFeatures !== existingLand.features)
      updatedLandData.features = landData.landFeatures;
    if (landData.landZoning !== existingLand.zoning)
      updatedLandData.zoning = landData.landZoning;
    if (landData.landSoilStructure !== existingLand.soilStructure)
      updatedLandData.soilStructure = landData.landSoilStructure;
    if (landData.landTopography !== existingLand.topography)
      updatedLandData.topography = landData.landTopography;
    if (landData.landPostalZipCode !== existingLand.postalZipCode)
      updatedLandData.postalZipCode = landData.landPostalZipCode;
    if (landData.landAccessibility !== existingLand.accessibility)
      updatedLandData.accessibility = landData.landAccessibility;

    // Add updatedAt timestamp if there are changes
    if (Object.keys(updatedLandData).length > 0) {
      updatedLandData.updatedAt = new Date();
      await prisma.land.update({
        where: { id: existingLand.id },
        data: updatedLandData,
      });
    }

    // Check for changes in the building data
    const updatedBuildingData = {};
    if (numberOfFloors !== existingBuilding.numberOfFloors)
      updatedBuildingData.numberOfFloors = numberOfFloors;
    if (yearBuilt !== existingBuilding.yearBuilt)
      updatedBuildingData.yearBuilt = yearBuilt;
    if (name !== existingBuilding.name) updatedBuildingData.name = name;
    if (type !== existingBuilding.type) updatedBuildingData.type = type;
    if (size !== existingBuilding.size) updatedBuildingData.size = size;
    if (description !== existingBuilding.description)
      updatedBuildingData.description = description;
    if (totalBathrooms !== existingBuilding.totalBathrooms)
      updatedBuildingData.totalBathrooms = totalBathrooms;
    if (totalBedrooms !== existingBuilding.totalBedrooms)
      updatedBuildingData.totalBedrooms = totalBedrooms;
    if (parkingSpaces !== existingBuilding.parkingSpaces)
      updatedBuildingData.parkingSpaces = parkingSpaces;
    if (amenities !== existingBuilding.amenities)
      updatedBuildingData.amenities = amenities;
    if (utilities !== existingBuilding.utilities)
      updatedBuildingData.utilities = utilities;
    if (maintenanceCost !== existingBuilding.maintenanceCost)
      updatedBuildingData.maintenanceCost = maintenanceCost;
    if (managementCompany !== existingBuilding.managementCompany)
      updatedBuildingData.managementCompany = managementCompany;
    if (constructionMaterial !== existingBuilding.constructionMaterial)
      updatedBuildingData.constructionMaterial = constructionMaterial;
    if (architect !== existingBuilding.architect)
      updatedBuildingData.architect = architect;
    if (uses !== existingBuilding.uses) updatedBuildingData.uses = uses;
    if (yearUpgraded !== existingBuilding.yearUpgraded)
      updatedBuildingData.yearUpgraded = yearUpgraded;

    // Add updatedAt timestamp if there are changes
    if (Object.keys(updatedBuildingData).length > 0) {
      updatedBuildingData.updatedAt = new Date();
    }

    // Update the building if there are changes
    let updatedBuilding;
    if (Object.keys(updatedBuildingData).length > 0) {
      updatedBuilding = await prisma.building.update({
        where: { id: buildingId },
        data: updatedBuildingData,
        include: {
          land: {
            include: {
              location: true, // Include location details of the associated land
            },
          },
        },
      });
    } else {
      updatedBuilding = existingBuilding;
    }

    res.status(200).json(updatedBuilding);
  } catch (error) {
    console.error("Error updating building:", error);
    res.status(500).json({ message: "Failed to update building" });
  }
};

export const deleteBuilding = async (req, res) => {
  const buildingId = req.params.id; // Assuming the building ID is passed as a route parameter

  try {
    // Find the building to be deleted
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      include: {
        land: {
          include: {
            location: true, // Include the location details of the associated land
          },
        },
      },
    });

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    // Delete the building
    await prisma.building.delete({
      where: { id: buildingId },
    });

    // Delete the associated land
    if (building.land) {
      await prisma.land.delete({
        where: { id: building.land.id },
      });

      // Delete the associated location if it's no longer referenced by any other entity
      if (building.land.location) {
        const locationId = building.land.location.id;
        const buildingsUsingLocation = await prisma.building.count({
          where: { land: { locationId } },
        });

        if (buildingsUsingLocation === 0) {
          await prisma.location.delete({
            where: { id: locationId },
          });
        }
      }
    }

    res
      .status(200)
      .json({ message: "Building, land, and location deleted successfully" });
  } catch (error) {
    console.error("Error deleting building:", error);
    res.status(500).json({ message: "Failed to delete building" });
  }
};
// Building Management End
