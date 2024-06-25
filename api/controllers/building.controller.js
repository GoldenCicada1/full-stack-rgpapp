import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

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
    locationData,
  } = req.body;

  // Validate required fields for locationData
  if (
    !locationData ||
    !locationData.country ||
    !locationData.latitude ||
    !locationData.longitude
  ) {
    return res.status(400).json({
      message: "locationData must include country, latitude, and longitude",
    });
  }

  // Validate required fields for landData
  if (
    !landData ||
    !landData.landName ||
    !landData.landSize ||
    !landData.landDescription
  ) {
    return res.status(400).json({
      message:
        "landName, landSize, and landDescription are required fields for landData",
    });
  }

  try {
    let finalLocationId;
    let finalLandId;

    // Process location data first
    if (locationData.locationId) {
      finalLocationId = locationData.locationId;
    } else {
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
          message:
            "Location data must include country, latitude, and longitude",
        });
      }

      // Check if the location already exists based on country and coordinates
      let location = await prisma.location.findFirst({
        where: {
          country,
          latitude,
          longitude,
        },
      });

      if (!location) {
        // If location doesn't exist, create a new one
        location = await prisma.location.create({
          data: {
            country,
            stateRegion: stateRegion || null,
            districtCounty: districtCounty || null,
            ward: ward || null,
            streetVillage: streetVillage || null,
            latitude,
            longitude,
          },
        });
      }

      // Set finalLocationId to the found or created location's id
      finalLocationId = location.id;
    }

    // Process land data next
    if (landData.landId) {
      finalLandId = landData.landId;
    } else {
      const {
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
      } = landData;

      // Validate required fields for land
      if (!landName || !landSize || !landDescription) {
        return res.status(400).json({
          message:
            "landName, landSize, and landDescription are required fields for landData",
        });
      }

      // Create the land using finalLocationId
      const newLand = await prisma.land.create({
        data: {
          name: landName,
          size: landSize,
          description: landDescription,
          features: landFeatures || [],
          zoning: landZoning || null,
          soilStructure: landSoilStructure || null,
          topography: landTopography || null,
          postalZipCode: landPostalZipCode || null,
          registered: landRegistered || null,
          registrationDate: landRegistrationDate || null,
          accessibility: landAccessibility || null,
          locationId: finalLocationId,
        },
      });

      // Set finalLandId to the newly created land's id
      finalLandId = newLand.id;
    }

    // Create the building using finalLandId
    const newBuilding = await prisma.building.create({
      data: {
        numberOfFloors,
        yearBuilt: yearBuilt || null,
        name,
        type: type || null,
        size: size || null,
        description,
        features: features || [],
        totalBedrooms: totalBedrooms || null,
        totalBathrooms: totalBathrooms || null,
        parkingSpaces: parkingSpaces || null,
        amenities: amenities || [],
        utilities: utilities || null,
        maintenanceCost: maintenanceCost || null,
        managementCompany: managementCompany || null,
        constructionMaterial: constructionMaterial || null,
        architect: architect || null,
        uses: uses || null,
        yearUpgraded: yearUpgraded || null,
        landId: finalLandId,
      },
      include: {
        land: {
          include: {
            location: true, // Include location details of the associated land
          },
        },
      },
    });

    res.status(201).json(newBuilding);
  } catch (error) {
    console.error("Error adding building:", error);
    res.status(500).json({ message: "Failed to add building" });
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

  console.log("req.body", req.body); // Debugging: Log the request body to see what's being sent

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
