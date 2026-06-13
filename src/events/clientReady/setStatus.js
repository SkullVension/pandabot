import { ActivityType } from "discord.js";

export default (client) => {
  client.user.setPresence({
    activities: [
      {
        name: "🎍 eating some bamboo",
        type: ActivityType.Playing,
      },
    ],
    status: "online",
  });
};
