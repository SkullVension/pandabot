import { EmbedBuilder } from "discord.js";
import data from "../../../config.json" with { type: "json" };
import rules from "../../data/rules.json" with { type: "json" };

const { prefixes } = data;

export default async (client, message) => {
  if (!message.guild || message.author.bot) return;

  const prefixUsed = prefixes.find((prefix) =>
    message.content.toLowerCase().startsWith(prefix.toLowerCase()),
  );
  if (!prefixUsed) return;

  const ruleNum = message.content.slice(prefixUsed.length).trim().toLowerCase();
  if (!/^r\d+$/.test(ruleNum)) return;

  const ruleIndex = parseInt(ruleNum.slice(1), 10) - 1;
  if (ruleIndex < 0 || ruleIndex >= rules.length) return;

  const rule = rules[ruleIndex];
  if (!rule) return;

  try {
    const description = rule.pts.map((pt) => `↳ ${pt}`).join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`📜 ${rule.t}`)
      .setDescription(description)
      .setColor(0x5865f2);
    message.channel.send({ embeds: [embed] });
  } catch (err) {
    console.error(err);
  }
};
