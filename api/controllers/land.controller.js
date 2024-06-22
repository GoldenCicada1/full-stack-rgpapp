import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

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
        location: true, // Include associated location details
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
    accessibility,
    locationData,
  } = req.body;

  // Validate required fields for land
  if (!name || !size || !description || !locationData) {
    return res.status(400).json({
      message:
        "Name, size, description, and locationData are required fields",
    });
  }

  try {
    let finalLocationId;

    // Check if locationId is provided directly
    if (locationData.locationId) {
      finalLocationId = locationData.locationId;
    } else {
      // Validate and create or find location if not provided directly
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
            "Location data must include  country, latitude, and longitude",
        });
      }

      // Check if the location already exists based on and country
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

    // Create the land using finalLocationId
    const newLand = await prisma.land.create({
      data: {
        name,
        size,
        description,
        features: features || [],
        zoning: zoning || null,
        soilStructure: soilStructure || null,
        topography: topography || null,
        postalZipCode: postalZipCode || null,
        accessibility: accessibility || null,
        location: {
          connect: { id: finalLocationId },
        },
      },
      include: {
        location: true, // Include location details in the response
      },
    });

    res.status(201).json(newLand);
  } catch (error) {
    console.error("Error adding land:", error);
    res.status(500).json({ message: "Failed to add land" });
  }
};
export const updateLand = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    size,
    description,
    features,
    zoning,
    soilStructure,
    topography,
    postalZipCode,
    accessibility,
    locationData,
  } = req.body;

  // Validate required fields for land
  if (!name || !size || !description || !locationData) {
    return res.status(400).json({
      message:
        "Name, size, description, and locationData are required fields",
    });
  }

  try {
    let finalLocationId;

    // Check if locationId is provided directly
    if (locationData.locationId) {
      finalLocationId = locationData.locationId;
    } else {
      // Validate and create or find location if not provided directly
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
          message:
            "Location data must include name,  country, latitude, and longitude",
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

    // Update the land using finalLocationId
    const updatedLand = await prisma.land.update({
      where: {
        id,
      },
      data: {
        name,
        size,
        description,
        features: features || [],
        zoning: zoning || null,
        soilStructure: soilStructure || null,
        topography: topography || null,
        postalZipCode: postalZipCode || null,
        accessibility: accessibility || null,
        location: {
          connect: { id: finalLocationId },
        },
      },
      include: {
        location: true, // Include location details in the response
      },
    });

    res.status(200).json(updatedLand);
  } catch (error) {
    console.error("Error updating land:", error);
    res.status(500).json({ message: "Failed to update land" });
  }
};
export const deleteLand = async (req, res) => {
  const landId = req.params.id;

  try {
    // Begin a Prisma transaction
    await prisma.$transaction(async (prisma) => {
      // Delete the land and its associated location
      await prisma.land.delete({
        where: {
          id: landId,
        },
        include: {
          location: true, // Include location details in the deletion
        },
      });
    });

    res
      .status(200)
      .json({ message: "Land and its location deleted successfully" });
  } catch (error) {
    console.error("Error deleting land:", error);
    res.status(500).json({ message: "Failed to delete land and its location" });
  }
};
// Land Management End
