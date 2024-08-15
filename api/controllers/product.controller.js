import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { processLandData } from "../lib/addLand.js";
import validator from "validator";

//Product Management Start//
export const getProducts = async (req, res) => {
  /* implementation */
};
export const getProductById = async (req, res) => {
  /* implementation */
};
export const addProductLand = async (req, res) => {
  const {
    productData: {
      status,
      category,
      active,
      landData,
      mediaData,
      leaseData,
    },
  } = req.body;

  // Validate and sanitize input
  if (!validator.isIn(status, ["forRent", "forSale", "both"])) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  if (
    !validator.isIn(category, [
      "agricultural",
      "vacantLand",
      "openSpaceRecreational",
    ])
  ) {
    return res.status(400).json({ error: "Invalid category value." });
  }

  // Validate required nested data
  if (!landData || !leaseData) {
    return res.status(400).json({
      error: "Missing required fields: landData and leaseData are required.",
    });
  }

  // Sanitize landData
  landData.landName = validator.escape(landData.landName);
  landData.landDescription = validator.escape(landData.landDescription);
  landData.landFeatures = Array.isArray(landData.landFeatures)
    ? landData.landFeatures.map((f) => validator.escape(f))
    : [];

  // Check if the land data has a valid location
  if (landData.locationData) {
    landData.locationData.address = validator.escape(
      landData.locationData.address
    );
  }

  // Sanitize mediaData if present
  if (mediaData) {
    mediaData.imageUrl = validator.escape(mediaData.imageUrl);
    mediaData.imageTitle = validator.escape(mediaData.imageTitle);
    mediaData.imageDescription = validator.escape(mediaData.imageDescription);
  }

  // Sanitize leaseData
  leaseData.termsAndConditions = validator.escape(leaseData.termsAndConditions);

  const tx = await prisma.$transaction(); // Start a transaction

  try {
    // Step 1: Retrieve Existing Land
    const { finalLandId, landExists } = await processLandData(landData, tx);

    // Step 2: Create New Product
    const customProductId = `PROD-${finalLandId}-${Date.now()}`;
    const product = await tx.product.create({
      data: {
        customId: customProductId,
        status: status,
        category: category,
        landId: finalLandId,
        active: active || true,
      },
    });

    // Step 3: Generate Automatic Lease Number
    const leaseNumber = `LEASE-${Date.now()}`;

    // Step 4: Create Lease Instance
    const lease = await tx.lease.create({
      data: {
        productId: product.id,
        leaseNumber: leaseNumber,
        price: leaseData.price,
        rentalPeriod: leaseData.rentalPeriod,
        discountPrice: leaseData.discountPrice,
        discountDuration: leaseData.discountDuration,
        status: leaseData.status,
        termsAndConditions: leaseData.termsAndConditions,
      },
    });

    // Step 5: Create and Associate Media (if applicable)
    let media;
    if (mediaData) {
      media = await tx.media.create({
        data: mediaData,
      });

      // Associate media with the product
      await tx.product.update({
        where: { id: product.id },
        data: { mediaId: media.id },
      });
    }

    // Commit the transaction
    await tx.$commit();

    // Step 6: Send Response
    return res.status(201).json({ product, lease, media });
  } catch (error) {
    await tx.$rollback(); // Rollback the transaction in case of error
    logger.error("Error adding product and land:", error);
    return res
      .status(500)
      .json({ error: "Failed to add product and land: " + error.message });
  }
};

export const updateProduct = async (req, res) => {
  /* implementation */
};
export const deleteProduct = async (req, res) => {
  /* implementation */
};
//Product Management End//
