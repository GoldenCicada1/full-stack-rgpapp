import prisma from "./prisma.js"; // Import Prisma client
import logger from "../lib/logger.js"; // Import the logger

export const processLeaseData = async (leaseData, tx) => {
  if (!leaseData) {
    throw new Error("Missing leaseData");
  }
  try {
    const {
        productId, // This can be optional
      price,
      rentalPeriod,
      discountPrice,
      discountDuration,
      termsAndConditions,
    } = leaseData;

    // Validate rentalPeriod
    const validPeriods = ["daily", "weekly", "monthly", "yearly"];
    if (rentalPeriod && !validPeriods.includes(rentalPeriod)) {
      throw new Error("Invalid rental period value.");
    }

    // Create new lease record
    const lease = await tx.lease.create({
      data: {
        product: productId ? { connect: { id: productId } } : undefined, // Only connect if productId is provided
        price,
        rentalPeriod,
        discountPrice,
        discountDuration,
        termsAndConditions,
      },
    });


    return { finalLeaseId: lease.id };
  } catch (error) {
    logger.error("Error processing lease data:", error);
    throw new Error("Failed to process lease data: " + error.message);
  }
};
