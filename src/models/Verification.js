import { Schema, model } from "mongoose";

const verificationSchema = new Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  captchaAnswer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }
});

verificationSchema.index({ guildId: 1, userId: 1 }, { unique: true });

export default model("Verification", verificationSchema);