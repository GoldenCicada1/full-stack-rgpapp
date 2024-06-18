import mongoose from "mongoose";
const landOwnershipSchema = new mongoose.Schema(
  {
    landIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
    }],
    ownerIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
    }],
  },
  { timestamps: true }
);

const LandOwnership = mongoose.model("LandOwnership", landOwnershipSchema);
export default LandOwnership;
