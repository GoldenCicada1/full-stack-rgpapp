import mongoose from "mongoose";
const buildingOwnershipSchema = new mongoose.Schema(
  {
    buildingIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
    }],
    ownerIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
    }],
  },
  { timestamps: true }
);

const BuildingOwnership = mongoose.model("BuildingOwnership", buildingOwnershipSchema);
export default BuildingOwnership;
