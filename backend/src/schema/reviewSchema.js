import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course is required"],
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  // Denormalized snapshot of the reviewer's identity at post time - this
  // codebase never does Mongoose .populate() and there is no public "get
  // user by id" endpoint (User isn't a browsable domain like Tag/Course), so
  // reviews carry their own display name/avatar rather than requiring a join.
  reviewerName: {
    type: String,
    trim: true,
  },
  reviewerAvatar: {
    type: String,
  },
}, {
  timestamps: true,
});

reviewSchema.index({ user: 1, course: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
