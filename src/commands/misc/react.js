const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
    }

    const message = interaction.options.getString("message");
    let targetMessage;

    try {
      const url = new URL(message);
      const pathParts = url.pathname.split("/").filter(Boolean);

      // format: /channels/<guildId>/<channelId>/<messageId>
      if (pathParts.length < 4 || pathParts[0] !== "channels") {
        throw new Error("Invalid message URL format.");
      }

      const [, guildId, channelId, messageId] = pathParts;

      const channel = await client.channels.fetch(channelId);
      targetMessage = await channel.messages.fetch(messageId);
    } catch (err) {
      console.error("Failed to fetch target message:", err);
      return interaction.reply({
        content:
          "Invalid message link provided. Please check the URL and try again.",
        ephemeral: true,
      });
    }

    if (!targetMessage) {
      return interaction.reply({
        content:
          "Could not find the specified message. Please check the link and try again.",
        ephemeral: true,
      });
    }

    try {
      const reactionsString = interaction.options.getString("reactions");
      if (reactionsString) {
        const reactions = reactionsString.split(",").map((r) => r.trim());
        for (const reaction of reactions) {
          await targetMessage.react(reaction).catch((err) => {
            console.error(`Failed to add reaction ${reaction}:`, err);
          });
        }
      }

      return interaction.reply({
        content: "Reactions added successfully!",
        ephemeral: true,
      });
    } catch (err) {
      console.error("Failed to add reactions:", err);
      return interaction.reply({
        content:
          "Failed to add reactions to the message. Please ensure I have permission to react and try again.",
        ephemeral: true,
      });
    }
  },
  name: "react",
  description: "React to a message by link",
  options: [
    {
      name: "message",
      description: "The message to react to (link)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reactions",
      description: "The reactions to add (comma separated, e.g. 👍,👎)",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
