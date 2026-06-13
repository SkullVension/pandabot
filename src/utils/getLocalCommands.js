import path from "path";
import { fileURLToPath } from "url";
import getAllFiles from "./getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (exceptions = []) => {
  let localCommands = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true,
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandModule = await import(commandFile);
      const commandObject =
        (commandModule && commandModule.default) || commandModule;

      if (exceptions.includes(commandObject.name)) {
        continue;
      }

      localCommands.push(commandObject);
    }
  }

  return localCommands;
};
