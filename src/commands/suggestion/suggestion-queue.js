import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import data from "../../../config.json" with { type: "json" };

const { serverConfig } = data;

export default {
  callback: async (client, interaction) => {
    // 1. Defer immediately to prevent Discord's 3-second timeout error (Unknown Interaction)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild()) {
      return interaction.editReply({
        content: "You can only run this command inside a server.",
      });
    }

    const messageId = interaction.options.getString("message_id");
    const reason = interaction.options.getString("reason") || "No additional note provided.";

    const suggestionsChannel = interaction.guild.channels.cache.get(
      serverConfig.suggestionsChannel,
    );
    if (!suggestionsChannel) {
      return interaction.editReply({
        content: "Suggestions channel is not configured correctly in config.json.",
      });
    }

    try {
      const targetMessage = await suggestionsChannel.messages.fetch(messageId);
      const originalEmbed = targetMessage.embeds[0];

      if (!originalEmbed) {
        return interaction.editReply({
          content: "Could not find an embed in that suggestion message.",
        });
      }

      const updatedEmbed = EmbedBuilder.from(originalEmbed)
        .setTitle("📌 Suggestion Queued")
        .setColor(0x5865f2) // Blurple
        .setFields([
          { name: "Staff Note", value: reason },
          { name: "Queued By", value: `<@${interaction.user.id}>`, inline: true },
        ]);

      await targetMessage.edit({ embeds: [updatedEmbed] });

if (targetMessage.thread) {
try {
await targetMessage.thread.send({
content: `📌 **Status Update:** This suggestion has been **Queued**.\n> **Note:** ${reason}`,
});
} catch (threadError) {
console.error("Failed to update thread:", threadError);
}


      return interaction.editReply({
        content: `Successfully queued suggestion: ${targetMessage.url}`,
      });
    } catch (error) {
      return interaction.editReply({
        content: "Failed to fetch the suggestion message. Ensure the Message ID is correct.",
      });
    }
  },

  name: "suggestion-queue",
  description: "Queue a suggestion for future development.",
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  options: [
    {
      name: "message_id",
      description: "The Message ID of the suggestion to queue",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reason",
      description: "Optional roadmap detail or staff note",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};