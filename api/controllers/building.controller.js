import validator from "validator";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import logger from "../lib/logger.js"; // Import the logger
import { processLandData } from "../lib/addLand.js"; // Adjust the import path as needed
import { generateBuildingCustomId } from "../lib/idGenerator.js"; // Adjust the import path as needed

// Building Management Start
export const getBuildings = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filter = {},
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const orderBy =
    sortBy in ["id", "name", "size", "createdAt"] ? sortBy : "createdAt";
  const orderDirection = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

  try {
    // Parse filter criteria (you might need to adjust this based on your schema and needs)
    const filters = {};

    if (filter.name) {
      filters.name = {
        contains: filter.name,
        mode: "insensitive",
      };
    }

    if (filter.type) {
      filters.type = filter.type;
    }

    // Retrieve buildings from the database
    const [totalCount, buildings] = await prisma.$transaction([
      prisma.building.count({ where: filters }),
      prisma.building.findMany({
        where: filters,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: {
          [orderBy]: orderDirection,
        },
        include: {
          land: {
            include: {
              location: true, // Include the location details of the associated land
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      buildings,
    });
  } catch (error) {
    console.error("Error fetching buildings:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch buildings: " + error.message });
  }
};

export const getBuildingById = async (req, res) => {
  const buildingId = req.params.id; // Assuming the building ID is passed as a route parameter

  if (!buildingId) {
    return res.status(400).json({ message: "Building ID is required." });
  }

  try {
    let building;

    // Check if the ID is a valid Object ID (assuming Object ID format is a 24-character hex string)
    if (/^[0-9a-fA-F]{24}$/.test(buildingId)) {
      // Query by Object ID
      building = await prisma.building.findUnique({
        where: { id: buildingId },
        include: {
          land: {
            include: {
              location: true, // Include the location details of the associated land
            },
          },
        },
      });
    } else {
      // Query by Custom ID
      building = await prisma.building.findUnique({
        where: { customId: buildingId },
        include: {
          land: {
            include: {
              location: true, // Include the location details of the associated land
            },
          },
        },
      });
    }

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    res.status(200).json(building);
  } catch (error) {
    console.error("Error fetching building:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch building: " + error.message });
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
    let building;

    // Check if the building ID is an Object ID or Custom ID
    if (/^[0-9a-fA-F]{24}$/.test(buildingId)) {
      // Object ID format (MongoDB)
      building = await prisma.building.findUnique({
        where: {
          id: buildingId,
        },
      });
    } else {
      // Custom ID format
      building = await prisma.building.findUnique({
        where: {
          customId: buildingId,
        },
      });
    }

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    // Delete the building
    await prisma.building.delete({
      where: {
        id: building.id, // Ensure deletion by Object ID
      },
    });

    res.status(200).json({ message: "Building deleted successfully" });
  } catch (error) {
    console.error("Error deleting building:", error);
    res.status(500).json({ message: "Failed to delete building" });
  }
};

export const deleteMultipleBuildings = async (req, res) => {
  const ids = req.body.ids; // Array of IDs passed in the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "IDs are required and should be an array." });
  }

  try {
    // Helper function to determine if an ID is an Object ID
    const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    // Create arrays to store Object IDs and Custom IDs
    const objectIds = [];
    const customIds = [];

    // Separate IDs into Object IDs and Custom IDs
    ids.forEach(id => {
      if (isObjectId(id)) {
        objectIds.push(id);
      } else {
        customIds.push(id);
      }
    });

    // Start a transaction to handle multiple deletions
    await prisma.$transaction(async (tx) => {
      // Delete buildings by Object ID
      if (objectIds.length > 0) {
        await tx.building.deleteMany({
          where: {
            id: { in: objectIds },
          },
        });
      }

      // Delete buildings by Custom ID
      if (customIds.length > 0) {
        const buildingsToDelete = await tx.building.findMany({
          where: {
            customId: { in: customIds },
          },
          select: { id: true }, // Retrieve Object IDs to delete
        });

        const buildingIdsToDelete = buildingsToDelete.map(building => building.id);

        if (buildingIdsToDelete.length > 0) {
          await tx.building.deleteMany({
            where: {
              id: { in: buildingIdsToDelete },
            },
          });
        }
      }
    });

    res.status(200).json({ message: "Buildings deleted successfully" });
  } catch (error) {
    console.error("Error deleting buildings:", error);
    res.status(500).json({ message: "Failed to delete buildings" });
  }
};

export const hardDeleteBuildings = async (req, res) => {
  const id = req.params.id; // ID passed as a route parameter

  try {
    // Start a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Determine if the ID is a custom ID or Object ID
      const isCustomId = !/^[0-9a-fA-F]{24}$/.test(id); // Simple check for Object ID format

      // Find the building by either custom ID or Object ID
      const building = isCustomId
        ? await tx.building.findUnique({
            where: { customId: id },
            include: {
              land: {
                include: {
                  location: true, // Include the location details
                },
              },
            },
          })
        : await tx.building.findUnique({
            where: { id: id },
            include: {
              land: {
                include: {
                  location: true, // Include the location details
                },
              },
            },
          });

      // Check if the building exists
      if (!building) {
        return res.status(404).json({ message: "Building not found" });
      }

      // Get the land ID and location ID
      const landId = building.land.id;
      const locationId = building.land.location?.id;

      // Find all buildings associated with the same land
      const buildingsToDelete = await tx.building.findMany({
        where: { landId: landId },
      });

      if (buildingsToDelete.length === 0) {
        return res.status(404).json({ message: "No buildings found for the land" });
      }

      // Delete all buildings associated with the land
      await tx.building.deleteMany({
        where: { landId: landId },
      });

      // Delete the land if it has no other buildings associated
      await tx.land.delete({
        where: { id: landId },
      });

      // Delete the location if it exists and is no longer associated with any land
      if (locationId) {
        await tx.location.delete({
          where: { id: locationId },
        });
      }

      res.status(200).json({ message: "Building and associated data deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting building and associated data:", error);
    res.status(500).json({ message: "Failed to delete building and associated data" });
  }
};
// Building Management End
