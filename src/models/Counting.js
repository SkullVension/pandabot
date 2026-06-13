import mongoose from "mongoose";

const countingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  counts: {
    type: Number,
    default: 0,
    required: true,
  },
});

export default mongoose.model("Counting", countingSchema);
