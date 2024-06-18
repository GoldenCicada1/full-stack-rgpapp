import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    parking: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Residential",
        "Commercial",
        "Industrial",
        "Agricultural",
        "Special Purpose",
        "Mixed-Use",
        "Vacant Land",
      ],
    },
    productype: {
      type: String,
      required: true,
      enum: ["land", "building"],
    },

    // Conditional fields based on type

    offer: {
      type: Boolean,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },

    
    // Foreign key references
    land_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: function () {
        return this.type === "land";
      },
    },

    building_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: function () {
        return this.type === "building";
      },
    },
    media_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },
    adminid: {
      type: String,
      required: true,
    },
    ownerid: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
