const { EmbedBuilder } = require("discord.js");
const { serverConfig } = require("../../../config.json");
const Profile = require("../../models/Profile");

module.exports = {
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

    // status
    const statusMap = {
      online: "🟢",
      idle: "🌙",
      dnd: "⛔",
      offline: "⚫",
    };

    const status = member.presence?.status
      ? statusMap[member.presence.status] || "⚫"
      : "⚫";

    // Database profile
    const profile = await Profile.findOne({ userId: target.id });

    const bio = profile?.bio;
    const country = profile?.country;
    const age = profile?.age;
    const github = profile?.github;
    const portfolio = profile?.portfolio;

    const joined = member.joinedAt
      ? member.joinedAt.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Unknown";

    const embed = new EmbedBuilder()
      .setTitle(`${status} ${target.displayName}`)
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
        value: `[${portfolio.replace("https://", "").replace("http://", "")}](${portfolio})`,
        inline: true,
      });
    }

    embed.setFooter({
      text: `Joined ${joined}`,
      iconURL: target.displayAvatarURL(),
    });

    await interaction.reply({
      embeds: [embed],
    });
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
