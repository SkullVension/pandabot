const { afks } = require("../../states/afk");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;

  if (afks.has(message.author.id)) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTitle("AFK Status Removed")
      .setDescription("Welcome back! Your AFK status has been removed.")
      // compare timestamp
      .setFooter({
        text: `You were AFK for ${Math.floor(
          (Date.now() -
            new Date(afks.get(message.author.id).timestamp).getTime()) /
            1000 /
            60,
        )} minutes.`,
      })
      .setColor(0x2b2d31);
    message.reply({ embeds: [embed] });
    afks.delete(message.author.id);
    return;
  }

  const mentionedAfks = message.mentions.users.filter((user) =>
    afks.has(user.id),
  );

  if (mentionedAfks.size > 0) {
    const descriptions = mentionedAfks.map((user) => {
      const reason = afks.get(user.id).reason;
      return `**${user.toString()}** is AFK${reason ? `: ${reason}` : ""}.`;
    });

    const embed = new EmbedBuilder()
      .setTitle("AFK Status")
      .setDescription(descriptions.join("\n"))
      .setColor(0x2b2d31);

    message.reply({ embeds: [embed] });
  }
};
