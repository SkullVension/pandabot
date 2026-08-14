import { EmbedBuilder } from "discord.js";
import Counting from "../../models/Counting.js";

export default {
  name: "countinglb",
  description: "View the counting leaderboard",
  aliases: ["clb", "countlb", "countingtop"],
  callback: async (client, message, args) => {
    if (message.author.bot) return;
    const counts = await Counting.find().sort({ counts: -1 }).limit(15);
    const leaderboard = counts.map((c, index) => ({
      userId: c.userId,
      counts: c.counts,
      rank: index + 1,
    }));

    const embed = new EmbedBuilder()
      .setTitle("Counting Leaderboard")
      .setColor(0x2b2d31);

    if (leaderboard.length === 0) {
      embed.setDescription("No counts yet!");
    } else {
      embed.setDescription(
        leaderboard
          .map(
            (entry) =>
              `**${entry.rank}.** <@${entry.userId}>${
                entry.userId === message.author.id ? " (You)" : ""
              } - **${entry.counts}**`
          )
          .join("\n")
      );
    }

    await message.reply({
      embeds: [embed],
    });
  },
};
