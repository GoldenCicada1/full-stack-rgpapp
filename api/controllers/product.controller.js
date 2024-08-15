import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { processLandData } from "../lib/addLand.js";
import { processMediaData } from "../lib/addMedia.js";
import { processLeaseData } from "../lib/addLease.js";
import validator from "validator";

//Product Management Start//

//Product Land Management Start//
export const addProductLand = async (req, res) => {
  // Log the incoming request body
  console.log("Request Body:", req.body);

  const { productData } = req.body;

  // Check if productData is provided
  if (!productData || !productData.landData) {
    return res.status(400).json({ error: "Missing required data" });
  }

  const { landData, status, category, mediaData, leaseData } = productData;

  // Custom validation for status and category
  const validStatuses = ["forRent", "forSale", "both"];
  const validCategories = [
    "agricultural",
    "vacantLand",
    "plot",
    "openSpaceRecreational",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: "Invalid category value." });
  }

  try {
    // Start the transaction
    const result = await prisma.$transaction(async (tx) => {
      try {
        let leaseId = null;

        // Create Lease if leaseData is provided
        if (leaseData) {
          const leaseResult = await processLeaseData(leaseData, tx);
          leaseId = leaseResult.finalLeaseId;
        }

        // Process Land Data and get finalLandId
        const { finalLandId } = await processLandData(landData, tx);

        if (!finalLandId) {
          throw new Error("Failed to get or create land.");
        }

        // Retrieve the existing land data by finalLandId to get customId
        const land = await tx.land.findUnique({
          where: { id: finalLandId },
          select: { customId: true }, // Only select the customId
        });

        if (!land) {
          throw new Error("Land with the provided ID does not exist.");
        }

        // Check if a product with the same land customId already exists
        const existingProduct = await tx.product.findUnique({
          where: { customId: land.customId },
        });

        if (existingProduct) {
          // Return error if product already exists
          throw new Error(
            "Product with the provided land ID is already available."
          );
        }

        // Process Media Data
        const mediaResult = mediaData
          ? await processMediaData(mediaData, tx)
          : null;

        // Create New Product
        const newProduct = await tx.product.create({
          data: {
            status,
            category,
            land: { connect: { id: finalLandId } }, // Connect to land using the correct field name
            media: mediaResult
              ? { connect: { id: mediaResult.finalMediaId } }
              : undefined, // Connect media if available
            customId: land.customId, // Use the land's customId for the product
            active: true, // Set default value or adjust as needed
            leaseId: leaseId || undefined, // Ensure leaseId is set in the product
          },
        });

        // Update Lease with the new productId if lease was created
        if (leaseId) {
          await tx.lease.update({
            where: { id: leaseId },
            data: {
              product: { connect: { id: newProduct.id } },
            },
          });
        }

        // Retrieve the newly created product with details
        const productWithDetails = await tx.product.findUnique({
          where: { id: newProduct.id },
          include: {
            land: {
              include: {
                location: true,
              },
            },
            media: true,
            Lease: true,
          },
        });

        // Return the results including the product and leaseId
        return { productWithDetails, leaseId };
      } catch (innerError) {
        // Log the specific error and rethrow it
        console.error("Error within transaction block:", innerError);
        throw innerError;
      }
    });

    // Send success response
    res.status(201).json({
      product: result.productWithDetails,
      leaseId: result.leaseId,
    });
  } catch (error) {
    // Log the error
    console.error("Error adding product and land:", error);

    // Check if the error message is related to existing product and send appropriate response
    if (
      error.message ===
      "Product with the provided land ID is already available."
    ) {
      res.status(400).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to add product and land: " + error.message });
    }
  } finally {
    await prisma.$disconnect();
  }
};

export const getProductLandById = async (req, res) => {
  const productId = req.params.id; // Assuming the product ID is passed as a route parameter

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required." });
  }

  try {
    let product;

    // Check if the ID is a valid Object ID (assuming Object ID format is a 24-character hex string)
    if (/^[0-9a-fA-F]{24}$/.test(productId)) {
      // Query by Object ID
      product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          land: {
            include: {
              location: true, // Include the location details of the associated land
            },
          },
          media: true,
          Lease: true,
        },
      });
    } else {
      // Query by Custom ID
      product = await prisma.product.findUnique({
        where: { customId: productId },
        include: {
          land: {
            include: {
              location: true, // Include the location details of the associated land
            },
          },
          media: true,
          Lease: true,
        },
      });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch product: " + error.message });
  }
};

//Product Land Management End//

export const getProducts = async (req, res) => {
  /* implementation */
};
export const getProductById = async (req, res) => {
  /* implementation */
};
export const updateProduct = async (req, res) => {
  /* implementation */
};
export const deleteProduct = async (req, res) => {
  /* implementation */
};
//Product Management End//
