import { PermissionFlagsBits } from "discord.js";

export default {
  name: "unhide",
  description: "Unhides current channel.",
  aliases: ["show"],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  async callback(client, message, args) {
    try {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        {
          ViewChannel: true,
        },
      );
      await message.reply("Channel has been unhidden.");
    } catch (err) {
      console.error("Error un hiding channel:", err);
    }
  },
};
