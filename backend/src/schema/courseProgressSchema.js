import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course is required"],
  },
  completedSubSections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubSection",
  }],
}, {
  timestamps: true,
});

courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

export default CourseProgress;
