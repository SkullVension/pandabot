import { ActivityType } from "discord.js";

let presenceInterval = null;

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

  if (presenceInterval) {
    clearInterval(presenceInterval);
  }

  presenceInterval = setInterval(setPresence, 60 * 60 * 1000);
};
