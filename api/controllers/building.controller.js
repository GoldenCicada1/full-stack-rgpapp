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

  // Validate required fields for building
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
        "numberOfFloors, name,  size, description, locationData, and landData are required fields",
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
      if (!address || !country || !latitude || !longitude) {
        return res.status(400).json({
          message:
            "Location data must include  country, latitude, and longitude",
        });
      }

      // Check if the location already exists based on  and country
      let location = await prisma.location.findFirst({
        where: {
          country,
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
        landNeighborhood,
        landAccessibility,
      } = landData;

      // Validate required fields for land
      if (!landName || !landSize || !landDescription) {
        return res.status(400).json({
          message:
            "landName, landSize, and landDescription  are required fields for landData",
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
          accessibility: landAccessibility || null,
          location: {
            connect: { id: finalLocationId },
          },
        },
        include: {
          location: true, // Include location details in the response
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
        totalBathrooms: totalBathrooms || null,
        totalBedrooms: totalBedrooms || null,
        parkingSpaces: parkingSpaces || null,
        amenities: amenities || [],
        utilities: utilities || null,
        maintenanceCost: maintenanceCost || null,
        managementCompany: managementCompany || null,
        constructionMaterial: constructionMaterial || null,
        architect: architect || null,
        uses: uses || null,
        yearUpgraded: yearUpgraded || null,
        land: {
          connect: {
            id: finalLandId,
          },
        },
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
        "numberOfFloors, name,  size, description, locationData, and landData are required fields",
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
      if (!address || !country || !latitude || !longitude) {
        return res.status(400).json({
          message:
            "Location data must include name, country, latitude, and longitude",
        });
      }

      // Check if the location already exists based on name, and country
      let location = await prisma.location.findFirst({
        where: {
          country,
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

    // Check if a Land record with the same locationId already exists
    let existingLand = await prisma.land.findFirst({
      where: {
        locationId: finalLocationId,
      },
    });

    // If an existing Land record is found, update it instead of creating a new one
    if (existingLand) {
      finalLandId = existingLand.id;

      // Update the existing Land record
      await prisma.land.update({
        where: { id: finalLandId },
        data: {
          name: landData.landName,
          size: landData.landSize,
          description: landData.landDescription,
          features: landData.landFeatures || [],
          zoning: landData.landZoning || null,
          soilStructure: landData.landSoilStructure || null,
          topography: landData.landTopography || null,
          postalZipCode: landData.landPostalZipCode || null,
          accessibility: landData.landAccessibility || null,
          location: {
            connect: { id: finalLocationId },
          },
        },
        include: {
          location: true,
        },
      });
    } else {
      // If no existing Land record is found, create a new one
      const newLand = await prisma.land.create({
        data: {
          name: landData.landName,
          size: landData.landSize,
          description: landData.landDescription,
          features: landData.landFeatures || [],
          zoning: landData.landZoning || null,
          soilStructure: landData.landSoilStructure || null,
          topography: landData.landTopography || null,
          postalZipCode: landData.landPostalZipCode || null,
          accessibility: landData.landAccessibility || null,
          location: {
            connect: { id: finalLocationId },
          },
        },
        include: {
          location: true,
        },
      });

      finalLandId = newLand.id;
    }

    // Update the building using finalLandId
    const updatedBuilding = await prisma.building.update({
      where: { id: buildingId },
      data: {
        numberOfFloors,
        yearBuilt: yearBuilt || null,
        name,
        type: type || null,
        size: size || null,
        description,
        totalBathrooms: totalBathrooms || null,
        totalBedrooms: totalBedrooms || null,
        parkingSpaces: parkingSpaces || null,
        amenities: amenities || [],
        utilities: utilities || null,
        maintenanceCost: maintenanceCost || null,
        managementCompany: managementCompany || null,
        constructionMaterial: constructionMaterial || null,
        architect: architect || null,
        uses: uses || null,
        yearUpgraded: yearUpgraded || null,
        land: {
          connect: { id: finalLandId },
        },
      },
      include: {
        land: {
          include: {
            location: true, // Include location details of the associated land
          },
        },
      },
    });

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
