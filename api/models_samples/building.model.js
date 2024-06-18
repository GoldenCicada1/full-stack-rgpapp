import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number_of_bathrooms: {
    type: Number,
    required: true,
  },
  number_of_bedrooms: {
    type: Number,
    required: true,
  },
});

const floorSchema = new mongoose.Schema({
  floor_number: {
    type: Number,
    required: true,
  },
  number_of_units: {
    type: Number,
    required: true,
  },
  units: {
    type: [unitSchema],
    default: [],
  },
});

const buildingSchema = new mongoose.Schema(
  {
    number_of_floors: {
      type: Number,
      required: true,
    },
    year_built: {
      type: Number,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    size: {
      type: Number,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    features: {
      type: [String],
      default: [],
    },
    apartment_count: {
      type: Number,
    },
    parking_spaces: {
      type: Number,
    },
    amenities: {
      type: [String],
      default: [],
    },
    utilities: {
      type: String,
    },
    maintenance_cost: {
      type: Number,
    },
    management_company: {
      type: String,
    },
    construction_material: {
      type: String,
    },
    architect: {
      type: String,
    },
    building_permit: {
      type: String,
    },
    uses: {
      type: String,
    },
    year_upgraded: {
      type: Number,
    },

    // Foreign key references

    land_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true,
    },
    adminid: {
      type: String,
      required: true,
    },
    ownerid: {
      type: String,
      required: true,
    },
    floors: [
      {
        type: floorSchema,
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Building = mongoose.model("Building", buildingSchema);
export default Building;
