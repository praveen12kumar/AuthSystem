import mongoose from "mongoose";

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
    required: [true, "Video URL is required"],
  },
  videoPublicId: {
    type: String,
  },
  duration: {
    type: Number,
    required: [true, "Duration is required"],
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: [true, "Section is required"],
  },
}, {
  timestamps: true,
});

const SubSection = mongoose.model("SubSection", subSectionSchema);

export default SubSection;
