import data from "../../../config.json" with { type: "json" };
import Counting from "../../models/Counting.js";
import { counts } from "../../states/counting.js";

const { serverConfig } = data;

export default async (client, message) => {
  try {
    if (!message?.guild) return;
    if (message.author?.bot) return;

    const channel = message.channel;
    const guildId = message.guild.id;
    const key = `${guildId}-${channel.id}`;

    if (channel.id !== serverConfig.countingChannel) return;

    const content = message.content.trim();
    let num = null;

    if (/^[0-9]+$/.test(content)) {
      num = parseInt(content, 10);
    } else if (/^[0-9+\-*/().%\s^]+$/.test(content)) {
      try {
        const safeExpr = content.replace(/\^/g, "**");
        if (/([+\-*/%^]{2,})/.test(safeExpr.replace(/\s+/g, ""))) return;

        const res = Function(`"use strict"; return (${safeExpr})`)();
        if (
          typeof res === "number" &&
          Number.isFinite(res) &&
          Number.isInteger(res)
        ) {
          num = res;
        } else return;
      } catch {
        return;
      }
    } else {
      return;
    }

    const raw = counts.get(key);
    const state = {
      lastNum: raw?.lastNum ?? 0,
      lastUser: raw?.lastUser ?? null,
      saves: raw?.saves ?? 0,
    };

    if (state.lastNum === 0) {
      if (num === 1) {
        counts.set(key, {
          lastNum: 1,
          lastUser: message.author.id,
          saves: 0,
        });

        let count = await Counting.findOne({ userId: message.author.id });

        if (!count) {
          count = new Counting({ userId: message.author.id, counts: 1 });
        } else {
          count.counts += 1;
        }

        await count.save().catch((err) => {
          console.error("Error saving count to database:", err);
        });

        await message.react("✅").catch(() => {});
        return;
      } else {
        counts.set(key, { lastNum: 0, lastUser: null, saves: 0 });

        await message.channel.send(
          `${message.author}, the count should start at **1**. Counter has been reset.`,
        );
        return;
      }
    }

    if (message.author.id === state.lastUser) {
      await message.channel.send(
        `${message.author}, you can't count twice in a row.`,
      );
      message.react("💢").catch(() => {});
      return;
    }

    if (num === state.lastNum + 1) {
      let newSaves = state.saves;

      try {
        switch (num) {
          case 25:
            await message.react("🌟");
            break;
          case 50:
            await message.react("😎");
            break;
          case 75:
            await message.react("✨");
            break;
          case 100:
            newSaves += 5;
            await message.channel.send(
              `We've reached **100** counts! +5 saves have been added!`,
            );
            await message.react("💯");
            await message.react("🏆");
            break;
          case 150:
            await message.react("🎉");
            break;
          case 200:
            await message.react("🥳");
            break;
          case 250:
            await message.react("🚀");
            break;
          case 300:
            await message.react("🌕");
            break;
          case 400:
            await message.react("🎆");
            break;
          case 500:
            newSaves += 3;
            await message.channel.send(
              `+3 saves have been added! Let's keep going!`,
            );
            await message.react("👑");
            break;
          case 750:
            await message.react("🤩");
            break;
          case 1000:
            newSaves += 10;
            await message.channel.send(
              `Incredible! We've reached **1000** counts! 🎉🏆`,
            );
            await message.channel.send(
              `+10 saves have been added! Let's keep going!`,
            );
            await message.react("🏅");
            await message.react("🏆");
            await message.react("🎉");
            break;
          default:
            await message.react("✅");
        }
      } catch {}

      counts.set(key, {
        lastNum: num,
        lastUser: message.author.id,
        saves: newSaves,
      });

      let count = await Counting.findOne({ userId: message.author.id });

      if (!count) {
        count = new Counting({ userId: message.author.id, counts: 1 });
      } else {
        count.counts += 1;
      }

      await count.save().catch((err) => {
        console.error("Error saving count to database:", err);
      });

      return;
    }

    if (state.saves && state.saves > 0) {
      const newSaves = state.saves - 1;

      counts.set(key, {
        lastNum: state.lastNum,
        lastUser: state.lastUser,
        saves: newSaves,
      });

      await message.channel.send(
        `${message.author}, wrong number — expected **${
          state.lastNum + 1
        }**. You have **${newSaves}** save${
          newSaves === 1 ? "" : "s"
        } left before reset.`,
      );
      return;
    }

    const expected = state.lastNum + 1;

    counts.set(key, {
      lastNum: 0,
      lastUser: null,
      saves: 0,
    });

    await message.channel.send(
      `${message.author}, wrong number — expected **${expected}**. Counter reset. Next number should be **1**.`,
    );

    message.react("❌").catch(() => {});
  } catch (err) {
    console.error("Counting handler error:", err);
  }
};
