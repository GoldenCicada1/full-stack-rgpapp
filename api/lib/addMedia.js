import validator from "validator";
import prisma from "./prisma.js"; // Import Prisma client
import logger from "../lib/logger.js"; // Import the logger

export const processMediaData = async (mediaData, tx) => {
  if (!mediaData) {
    throw new Error("Missing mediaData");
  }

  try {
    const {
      id, // Existing media ID (optional)
      imageUrl,
      imageTitle,
      imageDescription,
      videoUrl,
      videoTitle,
      videoDescription,
      virtualTourUrl,
      virtualTourTitle,
      virtualTourDescription,
    } = mediaData;

    // Create new media record
    const media = await tx.media.create({
      data: {
        imageUrl,
        imageTitle,
        imageDescription,
        videoUrl,
        videoTitle,
        videoDescription,
        virtualTourUrl,
        virtualTourTitle,
        virtualTourDescription,
      },
    });

    return { finalMediaId: media.id };
  } catch (error) {
    logger.error("Error processing media data:", error);
    throw new Error("Failed to process media data: " + error.message);
  }
};
