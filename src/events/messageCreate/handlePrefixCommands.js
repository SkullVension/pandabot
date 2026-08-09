import { pathToFileURL } from "url";
import path from "path";
import { fileURLToPath } from "url";
import data from "../../../config.json" with { type: "json" };
import getAllFiles from "../../utils/getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { prefixes } = data;

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
    const prefix = prefixes.find((p) => message.content.startsWith(p));
    if (!prefix) return;

    const expireAt = Date.now() + COOLDOWN_SECONDS * 1000;
    USER_COOLDOWNS.set(message.author.id, expireAt);
    setTimeout(
      () => USER_COOLDOWNS.delete(message.author.id),
      COOLDOWN_SECONDS * 1000,
    );

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const prefixCommandsPath = path.join(
      __dirname,
      "..",
      "..",
      "prefixCommands",
    );

    const prefixCommandsCategories = getAllFiles(prefixCommandsPath, true);
    const prefixCommands = [];

    for (const category of prefixCommandsCategories) {
      const commandFiles = getAllFiles(category);
      for (const file of commandFiles) {
        const mod = await import(pathToFileURL(file).href);
        const command = (mod && mod.default) || mod;
        prefixCommands.push(command);
      }
    }

    const commandObject = prefixCommands.find((cmd) => {
      if (!cmd || !cmd.name) return false;
      if (String(cmd.name).toLowerCase() === commandName) return true;
      if (Array.isArray(cmd.aliases)) {
        return cmd.aliases
          .map((a) => String(a).toLowerCase())
          .includes(commandName);
      }
      return false;
    });
    if (!commandObject) return;

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!message.member.permissions.has(permission)) {
          message.reply("Not enough permissions to run this command.");
          return;
        }
      }
    }
    if (typeof commandObject.callback === "function") {
      await commandObject.callback(client, message, args);
    }
  } catch (err) {
    console.error("Prefix Command Error:", err);
  }
};
