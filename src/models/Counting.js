const mongoose = require("mongoose");

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

module.exports = mongoose.model("Counting", countingSchema);
