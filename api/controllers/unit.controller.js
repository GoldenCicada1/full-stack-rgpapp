import validator from "validator";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import logger from "../lib/logger.js"; // Import the logger
import { processBuildingData } from "../lib/addBuilding.js"; // Adjust the import path as needed
import { generateUnitCustomId } from "../lib/idGenerator.js"; // Adjust the import path as needed

// Unit Management Start

export const getUnits = async (req, res) => {
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

    // Retrieve Units from the database
    const [totalCount, unit] = await prisma.$transaction([
      prisma.unit.count({ where: filters }),
      prisma.unit.findMany({
        where: filters,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: {
          [orderBy]: orderDirection,
        },
        include: {
          building: {
            include: {
              land: {
                include: {
                  location: true, // Include location details of the associated land
                },
              },
            },
          },
        },
      }),
    ]);
    res.status(200).json({
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      unit,
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch units: " + error.message });
  }
};

export const getUnitById = async (req, res) => {
  const unitId = req.params.id; // Assuming the unit ID is passed as a route parameter

  if (!unitId) {
    return res.status(400).json({ message: "Unit ID is required." });
  }

  try {
    let unit;

    // Check if the ID is a valid Object ID (assuming Object ID format is a 24-character hex string)
    if (/^[0-9a-fA-F]{24}$/.test(unitId)) {
      // Query by Object ID
      unit = await prisma.unit.findUnique({
        where: { id: unitId },
        include: {
          building: {
            include: {
              land: {
                include: {
                  location: true, // Include location details of the associated land
                },
              },
            },
          },
        },
      });
    } else {
      // Query by Custom ID
      unit = await prisma.unit.findUnique({
        where: { customId: unitId },
        include: {
          building: {
            include: {
              land: {
                include: {
                  location: true, // Include location details of the associated land
                },
              },
            },
          },
        },
      });
    }

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json(unit);
  } catch (error) {
    console.error("Error fetching unit:", error);
    res.status(500).json({ message: "Failed to fetch unit: " + error.message });
  }
};

export const addUnit = async (req, res) => {
  const {
    bathRoom,
    bedRoom,
    unitName,
    floorLevel,
    size,
    description,
    amenities,
    utilities,
    features,
    unitType,
    buildingData,
  } = req.body;

  // Validate and sanitize required fields for buildingData
  if (!buildingData) {
    return res.status(400).json({
      message: "buildingData is required",
    });
  }
  const sanitizedBuildingData = {
    ...buildingData,
    buildingNumberOfFloors: Number.isInteger(
      buildingData.buildingNumberOfFloors
    )
      ? buildingData.buildingNumberOfFloors
      : null,
    buildingYearBuilt: buildingData.buildingYearBuilt || null,
    buildingName: validator.escape(buildingData.buildingName || ""),
    buildingType: buildingData.buildingType || null,
    buildingSize: buildingData.buildingSize || null,
    buildingDescription: validator.escape(
      buildingData.buildingDescription || ""
    ),
    buildingFeatures: Array.isArray(buildingData.buildingFeatures)
      ? buildingData.buildingFeatures.map((f) => validator.escape(f))
      : [],
    buildingTotalBedrooms: buildingData.buildingTotalBedrooms || null,
    buildingTotalBathrooms: buildingData.buildingTotalBathrooms || null,
    buildingParkingSpaces: buildingData.buildingParkingSpaces || null,
    buildingAmenities: Array.isArray(buildingData.buildingAmenities)
      ? buildingData.buildingAmenities.map((a) => validator.escape(a))
      : [],
    buildingUtilities: buildingData.buildingUtilities || null,
    buildingMaintenanceCost: buildingData.buildingMaintenanceCost || null,
    buildingManagementCompany: buildingData.buildingManagementCompany || null,
    buildingConstructionMaterial:
      buildingData.buildingConstructionMaterial || null,
    buildingArchitect: buildingData.buildingArchitect || null,
    buildingUses: buildingData.buildingUses || null,
    buildingYearUpgraded: buildingData.buildingYearUpgraded || null,
  };

  try {
    const result = await prisma.$transaction(async (tx) => {
      //Process Building Data within the transaction
      const { finalBuildingId, buildingExists } = await processBuildingData(
        sanitizedBuildingData,
        tx
      );

      if (!finalBuildingId) {
        throw new Error("Failed to get or create Building.");
      }

      // Generate the custom ID for the Unit
      const customId = await generateUnitCustomId(finalBuildingId, tx);
      console.log("Generated customId:", customId, "Type:", typeof customId); // Debug

      // Create the unit using finalBuildingId and customId
      const newUnit = await tx.unit.create({
        data: {
          bathRoom: bathRoom || null,
          bedRoom: bedRoom || null,
          unitName: unitName || null,
          floorLevel: floorLevel || null,
          size: size || null,
          description: validator.escape(description) || null,
          amenities: amenities ? amenities.map((a) => validator.escape(a)) : [],
          utilities: utilities || null,
          features: features ? features.map((f) => validator.escape(f)) : [],
          unitType: unitType || null,
          buildingId: finalBuildingId,
          customId: customId,
        },
        include: {
          building: {
            include: {
              land: {
                include: {
                  location: true, // Include location details of the associated land
                },
              },
            },
          },
        },
      });
      return { newUnit, buildingExists };
    });

    res.status(201).json({
      message: result.buildingExists
        ? "Unit added successfully. The Building already existed."
        : "Unit added successfully. New Building was created.",
      data: result.newUnit,
    });
  } catch (error) {
    logger.error("Error adding building:", error);
    res
      .status(500)
      .json({ message: "Failed to add building: " + error.message });
  }
};

export const updateUnit = async (req, res) => {
  const unitId = req.params.id; // Assuming the unit ID is passed as a route parameter

  const {
    bathRoom,
    bedRoom,
    numberOfUnit,
    floorLevel,
    size,
    description,
    amenities,
    utilities,
    features,
    unitType,
    buildingData,
    landData,
    locationData,
  } = req.body;

  // Validate required fields for unit update
  if (
    !numberOfUnit ||
    !floorLevel ||
    !size ||
    !buildingData ||
    !landData ||
    !locationData
  ) {
    return res.status(400).json({
      message:
        "numberOfUnit, floorLevel, size, buildingData, landData, and locationData are required fields",
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

    // Fetch existing unit
    const existingUnit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        building: {
          include: {
            land: {
              include: {
                location: true,
              },
            },
          },
        },
      },
    });

    if (!existingUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    const existingBuilding = existingUnit.building;
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
    if (buildingData.numberOfFloors !== existingBuilding.numberOfFloors)
      updatedBuildingData.numberOfFloors = buildingData.numberOfFloors;
    if (buildingData.yearBuilt !== existingBuilding.yearBuilt)
      updatedBuildingData.yearBuilt = buildingData.yearBuilt;
    if (buildingData.name !== existingBuilding.name)
      updatedBuildingData.name = buildingData.name;
    if (buildingData.type !== existingBuilding.type)
      updatedBuildingData.type = buildingData.type;
    if (buildingData.size !== existingBuilding.size)
      updatedBuildingData.size = buildingData.size;
    if (buildingData.description !== existingBuilding.description)
      updatedBuildingData.description = buildingData.description;
    if (buildingData.totalBathrooms !== existingBuilding.totalBathrooms)
      updatedBuildingData.totalBathrooms = buildingData.totalBathrooms;
    if (buildingData.totalBedrooms !== existingBuilding.totalBedrooms)
      updatedBuildingData.totalBedrooms = buildingData.totalBedrooms;
    if (buildingData.parkingSpaces !== existingBuilding.parkingSpaces)
      updatedBuildingData.parkingSpaces = buildingData.parkingSpaces;
    if (buildingData.amenities !== existingBuilding.amenities)
      updatedBuildingData.amenities = buildingData.amenities;
    if (buildingData.utilities !== existingBuilding.utilities)
      updatedBuildingData.utilities = buildingData.utilities;
    if (buildingData.maintenanceCost !== existingBuilding.maintenanceCost)
      updatedBuildingData.maintenanceCost = buildingData.maintenanceCost;
    if (buildingData.managementCompany !== existingBuilding.managementCompany)
      updatedBuildingData.managementCompany = buildingData.managementCompany;
    if (
      buildingData.constructionMaterial !==
      existingBuilding.constructionMaterial
    )
      updatedBuildingData.constructionMaterial =
        buildingData.constructionMaterial;
    if (buildingData.architect !== existingBuilding.architect)
      updatedBuildingData.architect = buildingData.architect;
    if (buildingData.uses !== existingBuilding.uses)
      updatedBuildingData.uses = buildingData.uses;
    if (buildingData.yearUpgraded !== existingBuilding.yearUpgraded)
      updatedBuildingData.yearUpgraded = buildingData.yearUpgraded;

    // Add updatedAt timestamp if there are changes
    if (Object.keys(updatedBuildingData).length > 0) {
      updatedBuildingData.updatedAt = new Date();
      await prisma.building.update({
        where: { id: existingBuilding.id },
        data: updatedBuildingData,
      });
    }

    // Check for changes in the unit data
    const updatedUnitData = {};
    if (bathRoom !== existingUnit.bathRoom) updatedUnitData.bathRoom = bathRoom;
    if (bedRoom !== existingUnit.bedRoom) updatedUnitData.bedRoom = bedRoom;
    if (numberOfUnit !== existingUnit.numberOfUnit)
      updatedUnitData.numberOfUnit = numberOfUnit;
    if (floorLevel !== existingUnit.floorLevel)
      updatedUnitData.floorLevel = floorLevel;
    if (size !== existingUnit.size) updatedUnitData.size = size;
    if (description !== existingUnit.description)
      updatedUnitData.description = description;
    if (amenities !== existingUnit.amenities)
      updatedUnitData.amenities = amenities;
    if (utilities !== existingUnit.utilities)
      updatedUnitData.utilities = utilities;
    if (features !== existingUnit.features) updatedUnitData.features = features;
    if (unitType !== existingUnit.unitType) updatedUnitData.unitType = unitType;

    // Add updatedAt timestamp if there are changes
    if (Object.keys(updatedUnitData).length > 0) {
      updatedUnitData.updatedAt = new Date();
    }

    // Update the unit if there are changes
    let updatedUnit;
    if (Object.keys(updatedUnitData).length > 0) {
      updatedUnit = await prisma.unit.update({
        where: { id: unitId },
        data: updatedUnitData,
        include: {
          building: {
            include: {
              land: {
                include: {
                  location: true, // Include location details of the associated land
                },
              },
            },
          },
        },
      });
    } else {
      updatedUnit = existingUnit;
    }

    res.status(200).json(updatedUnit);
  } catch (error) {
    console.error("Error updating unit:", error);
    res.status(500).json({ message: "Failed to update unit" });
  }
};

export const deleteUnit = async (req, res) => {
  const unitId = req.params.id; // Assuming the unit ID is passed as a route parameter

  try {
    let unit;

    // Check if the unit ID is an Object ID or Custom ID
    if (/^[0-9a-fA-F]{24}$/.test(unitId)) {
      // Object ID format (MongoDB)
      unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
      });
    } else {
      // Custom ID format
      unit = await prisma.unit.findUnique({
        where: {
          customId: unitId,
        },
      });
    }

    if (!unit) {
      return res.status(404).json({ message: "unit not found" });
    }

    // Delete the unit
    await prisma.unit.delete({
      where: {
        id: unit.id, // Ensure deletion by Object ID
      },
    });

    res.status(200).json({ message: "unit deleted successfully" });
  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({ message: "Failed to delete unit" });
  }
};

export const deleteMultipleUnits = async (req, res) => {
  const ids = req.body.ids; // Array of IDs passed in the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "IDs are required and should be an array." });
  }

  try {
    // Helper function to determine if an ID is an Object ID
    const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    // Create arrays to store Object IDs and Custom IDs
    const objectIds = [];
    const customIds = [];

    // Separate IDs into Object IDs and Custom IDs
    ids.forEach((id) => {
      if (isObjectId(id)) {
        objectIds.push(id);
      } else {
        customIds.push(id);
      }
    });

    // Start a transaction to handle multiple deletions
    await prisma.$transaction(async (tx) => {
      // Delete units by Object ID
      if (objectIds.length > 0) {
        await tx.unit.deleteMany({
          where: {
            id: { in: objectIds },
          },
        });
      }

      // Delete units by Custom ID
      if (customIds.length > 0) {
        const unitsToDelete = await tx.unit.findMany({
          where: {
            customId: { in: customIds },
          },
          select: { id: true }, // Retrieve Object IDs to delete
        });

        const unitIdsToDelete = unitsToDelete.map((unit) => unit.id);

        if (unitIdsToDelete.length > 0) {
          await tx.unit.deleteMany({
            where: {
              id: { in: unitIdsToDelete },
            },
          });
        }
      }
    });

    res.status(200).json({ message: "units deleted successfully" });
  } catch (error) {
    console.error("Error deleting units:", error);
    res.status(500).json({ message: "Failed to delete units" });
  }
};

export const hardDeleteUnits = async (req, res) => {
  const id = req.params.id; // ID passed as a route parameter

  try {
    // Start a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Determine if the ID is a custom ID or Object ID
      const isCustomId = !/^[0-9a-fA-F]{24}$/.test(id); // Simple check for Object ID format

      // Find the building by either custom ID or Object ID
      const unit = isCustomId
        ? await tx.unit.findUnique({
            where: { customId: id },
            include: {
          building: {
            include: {
              land: {
                include: {
                  location: true, // Include location details of the associated land
                },
              },
            },
          },
        },
          })
        : await tx.unit.findUnique({
            where: { id: id },
            include: {
          building: {
            include: {
              land: {
                include: {
                  location: true, // Include location details of the associated land
                },
              },
            },
          },
        },
          });

      // Check if the unit exists
      if (!unit) {
        return res.status(404).json({ message: "unit not found" });
      }

      // Get the buildingId, land ID and location ID
      const buildingId = unit.building.id;
      const landId = unit.building.land.id;
      const locationId = unit.building.land.location?.id;

      // Find all buildings associated with the same land
      const unitsToDelete = await tx.unit.findMany({
        where: { buildingId: buildingId },
      });

      if (unitsToDelete.length === 0) {
        return res
          .status(404)
          .json({ message: "No units found for the land" });
      }

    

      // Delete all units associated with the land
      await tx.unit.deleteMany({
        where: { buildingId: buildingId },
      });

      // Delete the BUilding if it has no other units associated
      await tx.building.delete({
        where: {id: buildingId}
      });

      // Delete the land if it has no other units associated
      await tx.land.delete({
        where: { id: landId },
      });

      // Delete the location if it exists and is no longer associated with any land
      if (locationId) {
        await tx.location.delete({
          where: { id: locationId },
        });
      }

      res
        .status(200)
        .json({ message: "unit and associated data deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting unit and associated data:", error);
    res
      .status(500)
      .json({ message: "Failed to delete unit and associated data" });
  }
};
// Unit Management End
