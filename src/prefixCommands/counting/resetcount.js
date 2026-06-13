import { PermissionFlagsBits } from "discord.js";
import data from "../../../config.json" with { type: "json" };
import { counts } from "../../states/counting.js";

const { serverConfig } = data;

export default {
  name: "resetcount",
  description: "Resets the counting channel count.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  callback(client, message, args) {
    try {
      const guildId = message.guild.id;
      const channelId = serverConfig.countingChannel;
      const key = `${guildId}-${channelId}`;
      counts.set(key, { lastNum: 0, lastUser: null, saves: 3 });
      message.reply("Counter has been reset.");
    } catch (err) {
      console.error("Error resetting count:", err);
    }
  },
};
