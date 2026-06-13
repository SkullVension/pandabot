import { ApplicationCommandType } from "discord.js";

export default {
  name: "User Info",
  type: ApplicationCommandType.User,

  callback: async (client, interaction) => {
    const targetUser = interaction.targetUser;

    await interaction.reply({
      content: `User: ${targetUser.username}\nID: ${targetUser.id}\nJoined: ${
        interaction.targetMember?.joinedAt?.toDateString() || "N/A"
      }`,
      ephemeral: true,
    });
  },
};
