const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },

  bio: {
    type: String,
    default: "",
    maxLength: 200,
  },

  country: {
    type: String,
    default: "",
    maxLength: 50,
  },

  age: {
    type: Number,
    min: 0,
    max: 120,
  },

  github: {
    type: String,
    default: "",
  },

  portfolio: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Profile", profileSchema);
