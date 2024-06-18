import mongoose from "mongoose";
const agentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false, // Assuming ownership needs to be verified
    },
    availability: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Agent = mongoose.model("Agent", agentSchema);
export default Agent;
