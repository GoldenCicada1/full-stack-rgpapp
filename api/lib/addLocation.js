import validator from "validator";
import prisma from "./prisma.js"; // Import Prisma client
import logger from "../lib/logger.js"; // Import the logger

// Function to process location data
export const processLocationData = async (locationData, prisma) => {
  let finalLocationId;
  let locationExists = false; // To indicate if the location already exists

  try {
    // Check if locationId is provided
    if (locationData.locationId) {
      // Validate and sanitize locationId
      const sanitizedLocationId = validator.escape(locationData.locationId);

      // Check if the provided locationId exists
      const location = await prisma.location.findUnique({
        where: { id: sanitizedLocationId },
      });

      if (location) {
        // Location exists, use the provided locationId
        finalLocationId = location.id;
        locationExists = true;
      } else {
        // Provided locationId does not exist
        throw new Error("Provided locationId does not exist");
      }
    } else {
      // If no locationId provided, create a new location

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

      // Check if location already exists based on country, latitude, and longitude
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
