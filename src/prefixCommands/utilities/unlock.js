import { PermissionFlagsBits } from "discord.js";

export default {
  name: "unlock",
  description: "Unlocks current channel.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  async callback(client, message, args) {
    try {
      if (args.length > 0) {
        const user = message.mentions.users.first();
        if (user) {
          await message.channel.permissionOverwrites.delete(user.id);
          await message.reply(`Channel has been unlocked for ${user.tag}.`);
          return;
        }
      }
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        {
          SendMessages: true,
        },
      );
      await message.reply("Channel has been unlocked.");
    } catch (err) {
      console.error("Error unlocking channel:", err);
    }
  },
};
