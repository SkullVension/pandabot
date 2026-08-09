import data from "../../../config.json" with { type: "json" };
import Verification from "../../models/Verification.js";

const { serverConfig } = data;

export default async (client, message) => {
  if (message.guild || message.author.bot) return;

  const activeVerification = await Verification.findOne({ userId: message.author.id });
  if (!activeVerification) return;

  const targetGuild = client.guilds.cache.get(activeVerification.guildId);
  if (!targetGuild) return;

  const member = await targetGuild.members.fetch(message.author.id).catch(() => null);
  const suspendedRole = targetGuild.roles.cache.get(serverConfig.suspendedRoleId);

  if (!member || !suspendedRole) return;

  if (message.content.trim().toLowerCase() === activeVerification.captchaAnswer.toLowerCase()) {
try {
  await member.roles.remove(suspendedRole, "Passed manual text verification captcha.");
  
  await Verification.deleteOne({ userId: message.author.id });
  await message.reply("✅ Verification successful! Your server access has been completely restored.");
} catch (err) {
  console.error(`Verification error for user ${message.author.id}:`, err);
  await message.reply("❌ Verification failed due to a server error. Please try again or contact a moderator.");
}
  } else {
    await message.reply("❌ Incorrect code. Please look at the image carefully and try typing it again.");
}
};
