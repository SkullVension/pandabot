import { ActivityType } from "discord.js";

export default (client) => {
  const setPresence = () => {
    if (!client.user) return;
    client.user.setPresence({
      activities: [
        {
          name: "🐼 too lazy to load commands...",
          type: ActivityType.Listening,
        },
      ],
      status: "online",
    });
  };

  setPresence();

  if (client.presenceInterval) {
    clearInterval(client.presenceInterval);
  }

  client.presenceInterval = setInterval(setPresence, 60 * 60 * 1000);
};
