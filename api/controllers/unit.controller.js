import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";



// Unit Management Start

export const getUnits = async (req, res) => {};
export const getUnitById = async (req, res) => {};
export const addUnit = async (req, res) => {
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
        locationData,
        landData,
        buildingData,
      } = req.body;
    
      // Validate required fields for unit
      if (
        !numberOfUnit ||
        !floorLevel ||
        !size ||
        !locationData ||
        !landData ||
        !buildingData
      ) {
        return res.status(400).json({
          message:
            "numberOfUnit, floorLevel, size, locationData, landData, and buildingData are required fields",
        });
      }
    
      try {
        let finalLocationId;
        let finalLandId;
        let finalBuildingId;
    
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
    
          // Check if the location already exists based on country
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
    
        // Process building data next
        if (buildingData.buildingId) {
          finalBuildingId = buildingData.buildingId;
        } else {
          const {
            numberOfFloors,
            yearBuilt,
            buildingName,
            buildingType,
            buildingSize,
            buildingDescription,
            buildingTotalBathrooms,
            buildingTotalBedrooms,
            buildingParkingSpaces,
            buildingAmenities,
            buildingUtilities,
            buildingMaintenanceCost,
            buildingManagementCompany,
            buildingConstructionMaterial,
            buildingArchitect,
            buildingUses,
            buildingYearUpgraded,
          } = buildingData;
    
          // Validate required fields for building
          if (
            !numberOfFloors ||
            !buildingName ||
            !buildingSize ||
            !buildingDescription
          ) {
            return res.status(400).json({
              message:
                "numberOfFloors, buildingName, buildingSize, and buildingDescription are required fields for buildingData",
            });
          }
    
          // Create the building using finalLandId
          const newBuilding = await prisma.building.create({
            data: {
              numberOfFloors,
              yearBuilt: yearBuilt || null,
              name: buildingName,
              type: buildingType || null,
              size: buildingSize || null,
              description: buildingDescription,
              totalBathrooms: buildingTotalBathrooms || null,
              totalBedrooms: buildingTotalBedrooms || null,
              parkingSpaces: buildingParkingSpaces || null,
              amenities: buildingAmenities || [],
              utilities: buildingUtilities || null,
              maintenanceCost: buildingMaintenanceCost || null,
              managementCompany: buildingManagementCompany || null,
              constructionMaterial: buildingConstructionMaterial || null,
              architect: buildingArchitect || null,
              uses: buildingUses || null,
              yearUpgraded: buildingYearUpgraded || null,
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
    
          // Set finalBuildingId to the newly created building's id
          finalBuildingId = newBuilding.id;
        }
    
        // Create the unit using finalBuildingId
        const newUnit = await prisma.unit.create({
          data: {
            bathRoom: bathRoom || null,
            bedRoom: bedRoom || null,
            numberOfUnit,
            floorLevel,
            size,
            description: description || null,
            amenities: amenities || [],
            utilities: utilities || null,
            features: features || [],
            unitType: unitType || null,
            building: {
              connect: {
                id: finalBuildingId,
              },
            },
          },
          include: {
            building: {
              include: {
                land: {
                  include: {
                    location: true, // Include location details of the associated building's land
                  },
                },
              },
            },
          },
        });
    
        res.status(201).json(newUnit);
      } catch (error) {
        console.error("Error adding unit:", error);
        res.status(500).json({ message: "Failed to add unit" });
      }
};
export const updateUnit = async (req, res) => {};
export const deleteUnit = async (req, res) => {};

// Unit Management End
