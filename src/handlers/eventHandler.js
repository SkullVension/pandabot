import path from "path";
import { fileURLToPath , pathToFileURL } from "url";
import getAllFiles from "../utils/getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    let eventFiles = getAllFiles(eventFolder);
    eventFiles.sort();

    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        const eventModule = await import(pathToFileURL(eventFile).href);
        const eventFunction =
          (eventModule && (eventModule.default || eventModule.execute)) ||
          eventModule;

        if (typeof eventFunction === "function") {
          await eventFunction(client, ...args);
        } else {
          continue;
        }
      }
    });
  }
};
