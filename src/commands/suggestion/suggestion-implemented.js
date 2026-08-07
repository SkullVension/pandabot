import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import data from "../../../config.json" with { type: "json" };

const { serverConfig } = data;

export default {
  callback: async (client, interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.inGuild()) {
      return interaction.editReply({
        content: "You can only run this command inside a server.",
      });
    }

    const messageId = interaction.options.getString("message_id");
    const note = interaction.options.getString("note") || "This feature is now live!";

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
      .setTitle("✅ Suggestion Implemented")
      .setColor(0x5865f2)
      .addFields([
      { name: "Staff Note", value: note },
      { name: "Implemented By", value: `<@${interaction.user.id}>`, inline: true },
  ]);
  await targetMessage.edit({ embeds: [updatedEmbed] });

      if (targetMessage.thread) {
    try {
  await targetMessage.thread.send({
  content: `✅ **Status Update:** This suggestion has been **Implemented**!\n> **Note:** ${note}`,
  });
  await targetMessage.thread.setLocked(true, "Suggestion Implemented");
    } catch (threadError) {
      console.error("Failed to update thread:", threadError);
    }
  }        
      return interaction.editReply({
        content: `Successfully marked suggestion as implemented: ${targetMessage.url}`,
      });
    } catch (error) {
      return interaction.editReply({
        content: "Failed to fetch the suggestion message. Ensure the Message ID is correct.",
      });
    }
  },

  name: "suggestion-implemented",
  description: "Mark a suggestion as implemented.",
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  options: [
    {
      name: "message_id",
      description: "The Message ID of the suggestion implemented",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "note",
      description: "Optional release note or changelog link",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};
