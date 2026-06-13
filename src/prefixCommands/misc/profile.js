import { EmbedBuilder } from "discord.js";
import data from "../../../config.json" with { type: "json" };
import Profile from "../../models/Profile.js";

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

    const embed = new EmbedBuilder()
      .setTitle(`${target.displayName}`)
      .setColor(0x2b2d31)
      .setThumbnail(target.displayAvatarURL({ size: 256 }));

    if (badgeString) {
      embed.setDescription(badgeString);
    }

    if (bio) {
      embed.addFields({
        name: "Bio",
        value: bio,
        inline: false,
      });
    }

    if (country) {
      embed.addFields({
        name: "Country",
        value: country,
        inline: true,
      });
    }

    if (age) {
      embed.addFields({
        name: "Age",
        value: `${age}`,
        inline: true,
      });
    }

    if (stack) {
      embed.addFields({
        name: "Stack",
        value: stack,
        inline: true,
      });
    }

    if (github) {
      embed.addFields({
        name: "GitHub",
        value: `[@${github.split("/").pop()}](${github})`,
        inline: true,
      });
    }

    if (portfolio) {
      embed.addFields({
        name: "Portfolio",
        value: `[Click Here](${portfolio})`,
        inline: true,
      });
    }

    if (hobbies) {
      embed.addFields({
        name: "Hobbies",
        value: hobbies,
        inline: true,
      });
    }

    embed.setFooter({
      text: `Joined ${joined}`,
      iconURL: target.displayAvatarURL(),
    });

    await message.reply({
      embeds: [embed],
    });
  },
};
