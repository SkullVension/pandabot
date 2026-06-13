import { PermissionFlagsBits } from "discord.js";

export default {
  name: "hide",
  description: "Hides current channel.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  async callback(client, message, args) {
    try {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        {
          ViewChannel: false,
        },
      );
      await message.reply("Channel has been hidden.");
    } catch (err) {
      console.error("Error hiding channel:", err);
    }
  },
};
