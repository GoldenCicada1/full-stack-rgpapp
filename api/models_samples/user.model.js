import mongoose, { Mongoose } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {  
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      required: true,
      unique: true,
      type: String,
    },
    isCompany: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'owner', 'agent'], // Add other roles as needed
      default: 'user',
    },
    avatar: {
      type: String,
      default:
        "https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
