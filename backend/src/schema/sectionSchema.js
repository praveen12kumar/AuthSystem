import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course is required"],
  },
  subSections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubSection",
  }],
}, {
  timestamps: true,
});

const Section = mongoose.model("Section", sectionSchema);

export default Section;
