const { EmbedBuilder } = require("discord.js");
const Counting = require("../../models/Counting");

module.exports = {
  callback: async (client, interaction) => {
    if (interaction.user.bot) return;

    // Database profile
    const counts = await Counting.find().sort({ counts: -1 }).limit(15);
    const leaderboard = counts.map((c, index) => ({
      userId: c.userId,
      counts: c.counts,
      rank: index + 1,
    }));

    const embed = new EmbedBuilder()
      .setTitle(`Counting Leaderboard`)
      .setColor(0x2b2d31);

    if (leaderboard.length === 0) {
      embed.setDescription("No counts yet!");
    } else {
      embed.setDescription(
        leaderboard
          .map(
            (entry) =>
              `**${entry.rank}.** <@${entry.userId}>${
                entry.userId == interaction.user.id ? " (You)" : ""
              } - **${entry.counts}**`,
          )
          .join("\n"),
      );
    }

    await interaction.reply({
      embeds: [embed],
    });
  },

  name: "countinglb",
  description: "View the counting leaderboard",
};
