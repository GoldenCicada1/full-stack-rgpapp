import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

// Location Management Start
export const getLocations = async (req, res) => {
  const { stateRegion, country, ward, districtCounty } = req.query;

  try {
    const locations = await prisma.location.findMany({
      where: {
        stateRegion: stateRegion || undefined,
        country: country || undefined,
        ward: ward || undefined,
        districtCounty: districtCounty || undefined,
      },
    });

    res.status(200).json(locations);
  } catch (err) {
    console.error("Error fetching locations: ", err);
    res.status(500).json({ message: "Failed to get locations" });
  }
};
export const getLocationById = async (req, res) => {
  const id = req.params.id; // Extract location ID from request parameters

  try {
    // Fetch the location using Prisma
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        lands: false, // Include related lands if needed
      },
    });

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Optionally handle authorization logic here if needed

    // Return the location data
    res.status(200).json(location);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get location" });
  }
};
export const addLocation = async (req, res) => {
  const {
    country,
    stateRegion,
    districtCounty,
    ward,
    streetVillage,
    latitude,
    longitude,
  } = req.body;

  // Validate required fields
  if (
    !country ||
    !stateRegion ||
    !districtCounty ||
    !ward ||
    !streetVillage ||
    !latitude ||
    !longitude
  ) {
    return res.status(400).json({
      message:
        "country, state/region, district/county, ward, street/village, latitude, and longitude are required fields",
    });
  }

  try {
    // Check if the location already exists based on city, latitude, and longitude
    let existingLocation = await prisma.location.findFirst({
      where: {
        country,
        stateRegion,
        districtCounty,
        ward,
        streetVillage,
        latitude,
        longitude,
      },
    });

    if (existingLocation) {
      return res.status(400).json({ message: "Location already exists" });
    }

    // Create a new location if it doesn't exist
    const newLocation = await prisma.location.create({
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
    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({ message: "Failed to add location" });
  }
};

export const updateLocation = async (req, res) => {
  const { id } = req.params;
  const {
    country,
    stateRegion,
    districtCounty,
    ward,
    streetVillage,
    latitude,
    longitude,
  } = req.body;

  // Validate required fields
  if (
    !country ||
    !stateRegion ||
    !districtCounty ||
    !ward ||
    !streetVillage ||
    !latitude ||
    !longitude
  ) {
    return res.status(400).json({
      message:
        "country, state/region, district/county, ward, street/village, latitude, and longitude are required fields",
    });
  }

  try {
    // Check if the location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Update the location
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        country,
        stateRegion,
        districtCounty,
        ward,
        streetVillage,
        latitude,
        longitude,
      },
    });

    res.status(200).json(updatedLocation);
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Failed to update location" });
  }
};
export const deleteLocation = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Delete the location
    await prisma.location.delete({
      where: { id },
    });

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ message: "Failed to delete location" });
  }
};
// Location Management end
