import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { processLandData } from "../lib/addLand.js";
import { processMediaData } from "../lib/addMedia.js";
import validator from "validator";

//Product Management Start//
export const getProducts = async (req, res) => {
  /* implementation */
};
export const getProductById = async (req, res) => {
  /* implementation */
};
export const addProductLand = async (req, res) => {
  // Log the incoming request body
  console.log("Request Body:", req.body);

  const { productData } = req.body;

  // Check if productData is provided
  if (!productData || !productData.landData) {
    return res.status(400).json({ error: "Missing required data" });
  }

  const { landData, status, category, mediaData } = productData;

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
          landId: finalLandId,
          mediaId: mediaResult ? mediaResult.finalMediaId : null, // Attach mediaId if available
          customId: land.customId, // Use the land's customId for the product
          active: true, // Set default value or adjust as needed
        },
      });

      return newProduct;

    } catch (innerError) {
      // Log the specific error and rethrow it
      console.error("Error within transaction block:", innerError);
      throw innerError;
    }
    });

    const productWithDetails = await prisma.product.findUnique({
      where: { id: result.id },
      include: {
        land: {
          include: {
            location: true, // Include location details of the associated land
          },
        },
        media: true, // Include media details associated with the product
      },
    });

    // Send success response
    res.status(201).json({ product: productWithDetails });
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

export const updateProduct = async (req, res) => {
  /* implementation */
};
export const deleteProduct = async (req, res) => {
  /* implementation */
};
//Product Management End//
