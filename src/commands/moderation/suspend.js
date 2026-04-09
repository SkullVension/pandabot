const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { serverConfig } = require("../../../config.json");
const { createDocument } = require("../../utils/firestore");
const ms = require("ms");

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      const optMember = interaction.options.getMember("target-user");
      const reason =
        interaction.options.getString("reason") || "No reason provided";
      const duration = interaction.options.getString("duration") || null;
      const suspendedRole = interaction.guild.roles.cache.get(
        serverConfig.suspendedRoleId,
      );

      const validDuration = duration ? ms(duration) : null;
      await interaction.deferReply({ ephemeral: true });

      if (!optMember) {
        return interaction.editReply("That user doesn't exist in this server.");
      }

      if (optMember.roles.cache.has(suspendedRole.id)) {
        return interaction.editReply("This user is already suspended.");
      }

      const targetUserRolePosition = optMember.roles.highest.position;
      const requestUserRolePosition = interaction.member.roles.highest.position;
      const botRolePosition =
        interaction.guild.members.me.roles.highest.position;
      if (targetUserRolePosition >= requestUserRolePosition) {
        return interaction.editReply(
          "You can't suspend that user because they have the same/higher role than you.",
        );
      }
      if (targetUserRolePosition >= botRolePosition) {
        return interaction.editReply(
          "I can't suspend that user because they have the same/higher role than me.",
        );
      }
      // suspend user
      try {
        await optMember.roles.add(suspendedRole, `Suspended: ${reason}`);
      } catch (error) {
        console.error("Error suspending user:", error);
        return interaction.editReply(
          "There was an error suspending that user. Please try again.",
        );
      }
      // get current suspensions from firestore from `suspensions` collection
      // NOTE: Store only the latest suspension, not an array of suspensions
      await createDocument("suspensions", optMember.id, {
        moderatorId: interaction.user.id,
        reason: reason,
        duration: duration
          ? new Date(Date.now() + validDuration).toISOString()
          : null,
      });

      const embed = new EmbedBuilder()
        .setTitle("User Suspended")
        .setColor(0x5865f2)
        .addFields(
          {
            name: "Suspended User",
            value: `${optMember.user}`,
            inline: true,
          },
          {
            name: "Moderator",
            value: `${interaction.user}`,
            inline: true,
          },
          { name: "Reason", value: reason, inline: false },
        )
        .setThumbnail(optMember.user.displayAvatarURL({ size: 1024 }))
        .setTimestamp();

      if (duration) {
        embed.addFields({
          name: "Duration",
          value: duration,
          inline: true,
        });
      }

      const logChannel = interaction.guild.channels.cache.get(
        serverConfig.modLogChannel,
      );

      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      } else {
        console.warn(
          "Log channel not found, sending embed in current channel.",
        );
        await interaction.channel.send({ embeds: [embed] });
      }

      await interaction.editReply({
        content: `✅ Successfully Suspended **${optMember.user.tag}**`,
      });

      const dmEmbed = new EmbedBuilder()
        .setTitle(`You have been suspended from ${interaction.guild.name}`)
        .setColor(0xff0000)
        .addFields(
          { name: "Reason", value: reason, inline: false },
          {
            name: "Duration",
            value: "Until unsuspended by a moderator",
            inline: true,
          },
        )
        .setThumbnail(optMember.user.displayAvatarURL({ size: 1024 }))
        .setTimestamp();

      await optMember.send({ embeds: [dmEmbed] }).catch(() => {});
    } catch (error) {
      console.error(
        `There was an error when executing the suspend command: ${error}`,
      );
      await interaction.editReply({
        content: "❌ An error occurred while executing the suspend command.",
      });
    }
  },
  name: "suspend",
  description: "Suspend a user from the server.",
  options: [
    {
      name: "target-user",
      description: "The user you want to suspend.",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "reason",
      description: "The reason you want to suspend.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "duration",
      description:
        "The duration of the suspension (e.g. 1d, 2h, 30m). Leave empty for indefinite.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
