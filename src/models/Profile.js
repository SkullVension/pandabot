const { StickerPack } = require("discord.js");
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

  stack: {
    type: String,
    default: "",
    maxLength: 100,
  },

  github: {
    type: String,
    default: "",
  },

  portfolio: {
    type: String,
    default: "",
  },

  hobbies: {
    type: String,
    default: "",
    maxLength: 200,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
