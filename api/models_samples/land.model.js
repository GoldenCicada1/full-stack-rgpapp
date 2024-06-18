import mongoose from "mongoose";
const landSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    features: {
      type: [String], // Array of strings for features
      default: [],
    },
    zoning: {
      type: String,
    },
    soil_structure: {
      type: String,
    },
    topography: {
      type: String,
    },
    register: {
      registered: {
        type: Boolean,
        default: false,
      },
      registration_date: {
        type: Date,
        required: function () {
          return this.registered === true;
        },
      },
    },
    accessibility: {
      type: String,
    },

    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
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

const Land = mongoose.model("Land", landSchema);
export default Land;
