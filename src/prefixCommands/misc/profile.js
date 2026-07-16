import data from "../../../config.json" with { type: "json" };
import Profile from "../../models/Profile.js";
import buildProfileMessage from "../../utils/buildProfileMessage.js";

const { serverConfig } = data;

export default {
  name: "profile",
  description: "View a user's profile",
  aliases: ["pfp", "whois", "i", "pro"],
  callback: async (client, message, args) => {
    if (message.author.bot) return;

    // check if the user mentioned someone, or dropped in someone's id, otherwise show their own profile
    const target =
      message.mentions.users.first() ||
      (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null) ||
      message.author;
    const member = await message.guild.members.fetch(target.id);

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

    await message.reply(payload);
  },
};
