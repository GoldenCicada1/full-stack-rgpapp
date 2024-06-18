import mongoose from "mongoose";
const mediaSchema = new mongoose.Schema({
  image: {
    url: String,
    title: String,
    description: String,
  },
  productVideo: {
    url: String,
    title: String,
    description: String,
  },
  virtualTour: {
    url: String,
    title: String,
    description: String,
  },
});
const Media = mongoose.model("Media", mediaSchema);
export default Media;

