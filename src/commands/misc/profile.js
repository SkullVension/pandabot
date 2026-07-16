import data from "../../../config.json" with { type: "json" };
import Profile from "../../models/Profile.js";
import buildProfileMessage from "../../utils/buildProfileMessage.js";

const { serverConfig } = data;

export default {
  callback: async (client, interaction) => {
    if (interaction.user.bot) return;

    const target = interaction.options?.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(target.id);

    const { badgeRoles, badgeEmojis } = serverConfig;

    // Badges
    const badges = Object.entries(badgeRoles)
      .filter(([key, roleId]) => member.roles.cache.has(roleId))
      .map(([key]) => {
        const emojiId = badgeEmojis[key];
        return emojiId ? `<:${key}:${emojiId}>` : null;
      })
      .filter(Boolean);

    const badgeString = badges.length ? `${badges.join(" ")}` : "";

    // Database profile
    const profile = await Profile.findOne({ userId: target.id });

    const bio = profile?.bio;
    const country = profile?.country;
    const age = profile?.age;
    const stack = profile?.stack;
    const github = profile?.github;
    const portfolio = profile?.portfolio;
    const hobbies = profile?.hobbies;

    const joined = member.joinedAt
      ? member.joinedAt.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Unknown";

    const payload = buildProfileMessage({
      target,
      member,
      profile: {
        bio,
        country,
        age,
        stack,
        github,
        portfolio,
        hobbies,
      },
      joined,
      badgeString,
    });

    await interaction.reply(payload);
  },

  name: "profile",
  description: "View a user's profile",

  options: [
    {
      name: "user",
      description: "User to view",
      type: 6,
      required: false,
    },
  ],
};
