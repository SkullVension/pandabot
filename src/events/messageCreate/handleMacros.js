import data from "../../../config.json" with { type: "json" };
import macros from "../../data/macros.json" with { type: "json" };

const { macroPrefixes } = data;

const COOLDOWN_SECONDS = 3;
const USER_COOLDOWNS = new Map();

export default async (client, message) => {
  if (!message || !message.guild || message.author?.bot) return;

  const now = Date.now();
  const expiry = USER_COOLDOWNS.get(message.author.id);
  if (expiry && expiry > now) {
    return;
  }

  try {
    const prefix = macroPrefixes.find((p) => message.content.startsWith(p));
    if (!prefix) return;

    const expireAt = Date.now() + COOLDOWN_SECONDS * 1000;
    USER_COOLDOWNS.set(message.author.id, expireAt);
    setTimeout(
      () => USER_COOLDOWNS.delete(message.author.id),
      COOLDOWN_SECONDS * 1000,
    );

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const macroCategories = Object.keys(macros);

    let response = null;
    for (const category of macroCategories) {
      const categoryMacros = macros[category];
      const macro = categoryMacros.find((m) => {
        if (!m || !m.c) return false;
        if (String(m.c).toLowerCase() === commandName) return true;
        if (Array.isArray(m.a)) {
          return m.a.map((a) => String(a).toLowerCase()).includes(commandName);
        }
        return false;
      });
      if (macro) {
        response = macro.r;
        break;
      }
    }

    if (response) {
      await message.channel.send({ content: response });
    }
  } catch (err) {
    console.error("Prefix Command Error:", err);
  }
};
