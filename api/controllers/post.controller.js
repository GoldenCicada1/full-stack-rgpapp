import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const { city, type, property, bedroom, minPrice, maxPrice } = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        location: {
          city: city || undefined,
        },
        type: type || undefined,
        property: property || undefined,
        bedroom: bedroom ? parseInt(bedroom) : undefined,
        price: {
          gte: minPrice ? parseInt(minPrice) : undefined,
          lte: maxPrice ? parseInt(maxPrice) : undefined,
        },
      },
      include: {
        location: true, // Include related location data if needed
        user: true, // Include related user data if needed
        postDetail: true, // Include related post detail if needed
      },
    });
    


    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts: ", err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};


export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        location: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

     // Log the post object to check its structure

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res.status(200).json({ ...post, isSaved: saved ? true : false });
        } else {
          return res.status(200).json({ ...post, isSaved: false });
        }
      });
    } else {
      return res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;


  try {
    // Validate required fields
    const {
      title,
      price,
      images,
      bedroom,
      bathroom,
      type,
      property,
      locationId,
      locationData,
      postDetail
    } = body.postData;

    if (
      !title ||
      !price ||
      !images ||
      !bedroom ||
      !bathroom ||
      !type ||
      !property
    ) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Initialize locationId variable
    let finalLocationId;

    // Check if locationId is provided
    if (locationId) {
      finalLocationId = locationId; // Use provided locationId directly
    } else if (locationData) {
      if (!locationData.name || !locationData.address || !locationData.city || !locationData.country) {
        return res.status(400).json({ message: "Location data must include name, address, city, and country" });
      }

      // Check if the location already exists based on name, address, and city
      let location = await prisma.location.findFirst({
        where: {
          name: locationData.name,
          address: locationData.address,
          city: locationData.city,
        }
      });

      if (!location) {
        // If location doesn't exist, create a new one
        location = await prisma.location.create({
          data: {
            name: locationData.name,
            address: locationData.address,
            city: locationData.city,
            stateRegion: locationData.stateRegion || null,
            zipCode: locationData.zipCode || null,
            country: locationData.country,
            neighborhood: locationData.neighborhood || null,
            schoolDistrict: locationData.schoolDistrict || null,
            crimeRate: locationData.crimeRate || null,
            latitude: locationData.latitude || null,
            longitude: locationData.longitude || null,
          }
        });
      }

      // Set finalLocationId to the found or created location's id
      finalLocationId = location.id;
     } else {
      return res.status(400).json({ message: "Either locationId or locationData must be provided" });
    }

    // Create the post with finalLocationId
    const newPost = await prisma.post.create({
      data: {
        title,
        price,
        images,
        bedroom,
        bathroom,
        type,
        property,
        user: {
      connect: { id: req.userId }, // Connect to existing user
    },
        location: {
          connect: { id: finalLocationId }
        },
        postDetail: {
          create: body.postDetail,
        },
      },
    });

    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update posts" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { postDetail: true }, // Include the related PostDetail
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    // Delete the related PostDetail first, if it exists
    if (post.postDetail) {
      await prisma.postDetail.delete({
        where: { postId: id },
      });
    }

    // Now delete the Post
    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
