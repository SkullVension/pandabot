import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import data from "../../../config.json" with { type: "json" };
import { counts } from "../../states/counting.js";

const { serverConfig } = data;

export default {
  name: "setcount",
  description: "Sets the counting channel count.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  async callback(client, message, args) {
    try {
      const guildId = message.guild.id;
      const channelId = serverConfig.countingChannel;
      const key = `${guildId}-${channelId}`;
      counts.set(key, {
        lastNum: parseInt(args[0], 10) || 0,
        lastUser: null,
        saves: parseInt(args[1], 10) || 0,
      });

      const embed = new EmbedBuilder()
        .setTitle("Counter Updated")
        .setDescription(
          `The counter has been set to **${args[0]}**.\nNext number should be **${
            parseInt(args[0], 10) + 1
          }**.`,
        )
        .setColor(0x5865f2);

      await message.reply({ embeds: [embed], ephemeral: false });
    } catch (err) {
      console.error("Error setting count:", err);
    }
  },
};
