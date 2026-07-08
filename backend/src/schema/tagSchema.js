import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
