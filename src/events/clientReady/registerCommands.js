import { ApplicationCommandType } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import data from "../../../config.json" with { type: "json" };
import areCommandsDifferent from "../../utils/areCommandsDifferent.js";
import getAllFiles from "../../utils/getAllFiles.js";
import getApplicationCommands from "../../utils/getApplicationCommands.js";
import getLocalCommands from "../../utils/getLocalCommands.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { guildId } = data;

export default async (client) => {
  try {
    const localCommands = await getLocalCommands();
    const contextMenuCommands = [];
    const contextMenuCategories = getAllFiles(
      path.join(__dirname, "..", "..", "contextMenus"),
      true,
    );

    for (const contextMenuCategory of contextMenuCategories) {
      const contextMenuFiles = getAllFiles(contextMenuCategory);

      for (const file of contextMenuFiles) {
        const mod = await import(file);
        const command = (mod && mod.default) || mod;
        contextMenuCommands.push(command);
      }
    }

    const allCommands = [...localCommands, ...contextMenuCommands];
    const applicationCommands = await getApplicationCommands(client, guildId);

    for (const localCommand of allCommands) {
      const { name, description, options, type } = localCommand;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name,
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted command "${name}".`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          const commandData = { name };
          if (type === undefined || type === ApplicationCommandType.ChatInput) {
            commandData.description = description || "No description provided";
            if (Array.isArray(options) && options.length > 0) {
              commandData.options = options;
            }
          } else {
            commandData.type = type;
          }

          await applicationCommands.edit(existingCommand.id, commandData);

          console.log(`🔁 Edited command "${name}".`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(
            `⏩ Skipping registering command "${name}" as it's set to delete.`,
          );
          continue;
        }

        const commandData = { name };
        if (type === undefined || type === ApplicationCommandType.ChatInput) {
          commandData.description = description || "No description provided";
          if (Array.isArray(options) && options.length > 0) {
            commandData.options = options;
          }
        } else {
          commandData.type = type;
        }

        await applicationCommands.create(commandData);

        console.log(`👍 Registered command "${name}."`);
      }
    }
    // await applicationCommands.set([]);
  } catch (error) {
    console.log(`There was an error in ${__filename}: ${error}`);
  }
};
