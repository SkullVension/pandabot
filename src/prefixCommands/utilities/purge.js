const { PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "purge",
  description: "Purges messages from the current channel.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  async callback(client, message, args) {
    try {
      const deleteCount = parseInt(args[0], 10);
      if (isNaN(deleteCount) || deleteCount < 1 || deleteCount > 100) {
        await message.reply(
          "Please provide a valid number of messages to delete (1-100).",
        );
        return;
      }
      const deletedMessages = await message.channel.bulkDelete(
        deleteCount,
        true,
      );
      const embed = new EmbedBuilder()
        .setTitle("✅ Messages Purged")
        .setDescription(
          `**Channel**: ${message.channel}
          **Moderator**: <@${message.author.id}>
          **Deleted Messages**: ${deletedMessages.size}
          `,
        )
        .setColor("Green")
        .setTimestamp();
      const reply = await message.channel.send({ embeds: [embed] });

      setTimeout(async () => {
        await reply.delete();
      }, 10000);
    } catch (err) {
      console.error("Error purging messages:", err);
    }
  },
};
