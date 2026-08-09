import { Schema, model } from "mongoose";

const suspendedMemberSchema = new Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  suspendedAt: { type: Date, default: Date.now }
});

export default model("SuspendedMember", suspendedMemberSchema);