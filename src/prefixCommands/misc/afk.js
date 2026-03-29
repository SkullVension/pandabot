const { afks } = require("../../states/afk");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "afk",
  description: "Set your status to AFK",
  callback(client, message, args) {
    try {
      const reason = args.join(" ") || undefined;
      const timestamp = new Date().toISOString();

      afks.set(message.author.id, {
        reason,
        timestamp,
      });
      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTitle("AFK Status Set")
        .setDescription(`You are now AFK${reason ? `: ${reason}` : ""}.`)
        .setColor(0x2b2d31);
      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
    }
  },
};
