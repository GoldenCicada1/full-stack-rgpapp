import prisma from "./prisma.js"; // Import Prisma client
import validator from "validator"; // Import validator
import logger from "./logger.js"; // Import your logger

// Function to process and update location data
export const updateLocationData = async (existingLocation, locationData) => {
  try {
    const {
      country,
      stateRegion,
      districtCounty,
      ward,
      streetVillage,
      latitude,
      longitude,
    } = locationData;

    // Validate and sanitize location data
    if (!country || !latitude || !longitude) {
      throw new Error(
        "Location data must include country, latitude, and longitude"
      );
    }

    const sanitizedCountry = validator.escape(country);
    const sanitizedStateRegion = stateRegion
      ? validator.escape(stateRegion)
      : "";
    const sanitizedDistrictCounty = districtCounty
      ? validator.escape(districtCounty)
      : "";
    const sanitizedWard = ward ? validator.escape(ward) : "";
    const sanitizedStreetVillage = streetVillage
      ? validator.escape(streetVillage)
      : "";
     // Convert latitude and longitude to strings for Prisma
     const sanitizedLatitude = validator
     .toFloat(locationData.latitude)
     .toString();
   const sanitizedLongitude = validator
     .toFloat(locationData.longitude)
     .toString();


    // Check for changes in the location data
    const updatedLocationData = {};
    if (sanitizedCountry !== existingLocation.country)
      updatedLocationData.country = sanitizedCountry;
    if (sanitizedStateRegion !== existingLocation.stateRegion)
      updatedLocationData.stateRegion = sanitizedStateRegion;
    if (sanitizedDistrictCounty !== existingLocation.districtCounty)
      updatedLocationData.districtCounty = sanitizedDistrictCounty;
    if (sanitizedWard !== existingLocation.ward)
      updatedLocationData.ward = sanitizedWard;
    if (sanitizedStreetVillage !== existingLocation.streetVillage)
      updatedLocationData.streetVillage = sanitizedStreetVillage;
    if (sanitizedLatitude !== existingLocation.latitude)
      updatedLocationData.latitude = sanitizedLatitude;
    if (sanitizedLongitude !== existingLocation.longitude)
      updatedLocationData.longitude = sanitizedLongitude;

    // Validate required fields for location
    if (!country || !latitude || !longitude) {
      throw new Error(
        "Location data must include country, latitude, and longitude"
      );
    }

    // Update the location if there are changes
    if (Object.keys(updatedLocationData).length > 0) {
      updatedLocationData.updatedAt = new Date();
      await prisma.$transaction(async (prisma) => {
        await prisma.location.update({
          where: { id: existingLocation.id },
          data: updatedLocationData,
        });
      });
    }

    return updatedLocationData;
  } catch (error) {
    // Log the error
    logger.error("Error updating location data:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};
