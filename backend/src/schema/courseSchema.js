import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  thumbnail: {
    type: String,
    required: [true, "Thumbnail is required"],
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Instructor is required"],
  },
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
  }],
  tags: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    }],
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length > 0,
      message: "At least one tag is required",
    },
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numberOfRatings: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
