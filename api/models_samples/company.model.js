import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    compName: {
      type: String,
      required: true,
      unique: true,
    },
    compLogo: {
      type: String,
      default: "https://example.com/default-logo.png", // Provide a default logo URL
    },
    compVerified: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      enum: ["government", "private"], // Assuming only two types of entities are possible
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contact: {
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    website: {
      type: String,
      required: true,
    },

    socialMedia: {
      linkedIn: String,
      twitter: String,
      // Add more social media links as needed
    },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['ceo', 'employee', 'manager'],
        default: 'employee',
      },
    }],
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
