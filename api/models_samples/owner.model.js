import mongoose from "mongoose";
const ownerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Assuming one user can be associated with only one owner
    },
    
    verified: {
      type: Boolean,
      default: false, // Assuming ownership needs to be verified
    },
    entityType: {
      type: String,
      enum: ['government', 'private'], // Assuming only two types of entities are possible
      required: true,
    },
  },
  { timestamps: true }
);

const Owner = mongoose.model("Owner", ownerSchema);
export default Owner;
