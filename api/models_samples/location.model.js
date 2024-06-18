import mongoose from "mongoose";
const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state_region: {
      type: String,
      required: true,
    },
    zip_code: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    neighborhood: {
      type: String,
    },
    school_district: {
      type: String,
    },
    crime_rate: {
      type: Number,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere', // Optional for geospatial indexing
      },
    }
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", locationSchema);
export default Location;
