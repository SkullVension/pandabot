const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "unhide",
  description: "Unhides current channel.",
  aliases: ["show"],
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
