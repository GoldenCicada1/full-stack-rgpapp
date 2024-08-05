import validator from "validator";
import prisma from "./prisma.js"; // Import Prisma client
import logger from "../lib/logger.js"; // Import the logger

// Function to process location data
export const processLocationData = async (locationData, prisma) => {
    let finalLocationId;
    let locationExists = false; // To indicate if the location already exists

  try {
    // Sanitize input
    const sanitizedCountry = validator.escape(locationData.country);
    const sanitizedStateRegion = validator.escape(
      locationData.stateRegion || ""
    );
    const sanitizedDistrictCounty = validator.escape(
      locationData.districtCounty || ""
    );
    const sanitizedWard = validator.escape(locationData.ward || "");
    const sanitizedStreetVillage = validator.escape(
      locationData.streetVillage || ""
    );

    // Convert latitude and longitude to strings for Prisma
    const sanitizedLatitude = validator
      .toFloat(locationData.latitude)
      .toString();
    const sanitizedLongitude = validator
      .toFloat(locationData.longitude)
      .toString();

    // Check if location already exists
    let location = await prisma.location.findFirst({
      where: {
        country: sanitizedCountry,
        latitude: sanitizedLatitude,
        longitude: sanitizedLongitude,
      },
    });

    if (location) {
      // Location already exists
      locationExists = true;
      finalLocationId = location.id;
    } else {
      // If location doesn't exist, create a new one
      location = await prisma.location.create({
        data: {
          country: sanitizedCountry,
          stateRegion: sanitizedStateRegion,
          districtCounty: sanitizedDistrictCounty,
          ward: sanitizedWard,
          streetVillage: sanitizedStreetVillage,
          latitude: sanitizedLatitude,
          longitude: sanitizedLongitude,
        },
      });
      finalLocationId = location.id;
    }

    // Return whether the location exists and the final location ID
    return { finalLocationId, locationExists };
  } catch (error) {
    // Log the error
    logger.error("Error processing location data:", error);

    // Throw a custom error with a message
    throw new Error("Failed to process location data: " + error.message);
  }
};
