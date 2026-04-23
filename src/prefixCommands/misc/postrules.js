const { EmbedBuilder } = require("discord.js");
const rulesData = require("../../data/rules.json");

module.exports = {
  name: "postrules",
  description: "Posts the server rules in the current channel.",
  callback: (client, message, args) => {
    try {
      const rulesText = rulesData
        .map(
          (rule) =>
            `**${rule.t}**\n${rule.pts.map((pt) => `↳ ${pt}`).join("\n")}\n`,
        )
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("📜 DevHub Server Rules")
        .setDescription(rulesText)
        .setColor(0x5865f2);
      return message.channel.send({ embeds: [embed] });
    } catch (err) {}
  },
};
