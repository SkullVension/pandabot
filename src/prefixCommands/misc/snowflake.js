import { EmbedBuilder } from "discord.js";

export default {
  name: "snowflake",
  description:
    "Decodes a Discord Snowflake ID to extract its creation metadata.",
  aliases: ["sf"],

  async callback(client, message, args) {
    const idStr = args[0];

    if (!idStr) {
      return message.reply(
        "❌ Please provide a valid Discord ID to decode. Example: `p!snowflake 123456789012345678`",
      );
    }

    if (!/^\d+$/.test(idStr)) {
      return message.reply(
        "❌ That doesn't look like a valid Discord ID. It must contain numbers only.",
      );
    }

    try {
      const id = BigInt(idStr);

      const DISCORD_EPOCH = 1420070400000n;

      const timestampMs = Number((id >> 22n) + DISCORD_EPOCH);
      const workerId = Number((id >> 17n) & 0x1fn);
      const processId = Number((id >> 12n) & 0x1fn);
      const increment = Number(id & 0xfffn);

      const date = new Date(timestampMs);
      const unixTimestamp = Math.floor(timestampMs / 1000);

      const embed = new EmbedBuilder()
        .setTitle("❄️ Snowflake Decoder Result")
        .setColor("#5865F2")
        .setDescription(`Decoded metadata for raw ID: \`${idStr}\``)
        .addFields(
          { name: "Creation Date", value: date.toUTCString(), inline: false },
          {
            name: "Relative Time",
            value: `<t:${unixTimestamp}:R>`,
            inline: true,
          },
          {
            name: "Unix Milliseconds",
            value: `\`${timestampMs}\``,
            inline: true,
          },
          { name: "Worker ID", value: `\`${workerId}\``, inline: true },
          { name: "Process ID", value: `\`${processId}\``, inline: true },
          { name: "Increment Index", value: `\`${increment}\``, inline: true },
        )
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        });

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Snowflake processing error:", error);
      return message.reply(
        "❌ An error occurred while decoding that ID. Make sure it's a valid 64-bit integer.",
      );
    }
  },
};
