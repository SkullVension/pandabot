import {
  ActionRowBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export default {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (interaction.user.bot) return;

    const embedContent = `This channel is here to explain how our ticket system works and keep everything organized.

Tickets are the best way to get help and ensure moderators can respond quickly. Here’s what you can use them for:
- 🧩 General Support: For questions, technical issues, or anything else you need assistance with, tickets help us track and resolve them.
- 🎭 Request Unban / Unmute: If you or a friend need to appeal a ban, mute or suspend, open a ticket and provide the details.
- 🚨 Report User: If you need to report someone, tickets make sure the moderators see it right away and can investigate properly.
- ⚒️ Apply For Staff: Interested in joining our moderation team? Use a ticket to submit your application and tell us why you’d be a great fit.
- 🤝 Partnership: If you're interested in partnering with us, open a ticket and provide details about your proposal.
- 📝 Other: For any other reasons, open a ticket and explain your situation.

You’ll be guided through a simple form to explain your reason. I will handle the process, create a private channel for your case, and keep everything neat and secure. Thanks for helping us keep the community clean ✨`;

    const selectMenu = [
      {
        label: "🧩 General Support",
        value: "support",
        fields: [
          {
            customId: "reason",
            label: "What do you need help with?",
            style: "PARAGRAPH",
            placeholder: "Explain what you need help with",
            required: true,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "🎭 Request Unban / Unmute",
        value: "appeal",
        fields: [
          {
            customId: "reason",
            label: "Reason",
            style: "PARAGRAPH",
            placeholder: "Explain why you are requesting unban/unmute",
            required: true,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "🚨 Report User",
        value: "report",
        fields: [
          {
            customId: "reason",
            label: "Who are you reporting and why?",
            style: "PARAGRAPH",
            placeholder: "Provide details about the user you are reporting",
            required: true,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "⚒️ Apply For Staff",
        value: "staff",
        fields: [
          {
            customId: "reason",
            label: "Why do you want to join the staff team?",
            style: "PARAGRAPH",
            placeholder: "Explain why you want to join the staff team",
            required: true,
            maxLength: 1024,
          },
          {
            customId: "experience",
            label: "Do you have any prior moderation experience?",
            style: "PARAGRAPH",
            placeholder: "Describe any prior moderation experience you have",
            required: false,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "📝 Other",
        value: "other",
        fields: [
          {
            customId: "reason",
            label: "Reason",
            style: "PARAGRAPH",
            placeholder: "Explain why you are opening this ticket",
            required: true,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "🤝 Partnership",
        value: "partnership",
        fields: [
          {
            customId: "about",
            label: "What is your server about?",
            style: "PARAGRAPH",
            placeholder: "Provide details about your community",
            required: true,
            maxLength: 1024,
          },
        ],
      },
    ];

    const select = new StringSelectMenuBuilder()
      .setCustomId("ticket_type_select")
      .setPlaceholder("Select ticket type")
      .addOptions(
        selectMenu.map(
          (option) =>
            new StringSelectMenuOptionBuilder({
              label: option.label,
              value: option.value,
            }),
        ),
      );

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setTitle("🎫 Tickets")
      .setDescription(embedContent);

    await interaction.deferReply({ ephemeral: true });

    const message = await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.editReply({
      content: "Ticketing system has been set up in this channel.",
    });

    return;
  },

  name: "ticket",
  description: "Send the ticketing system setup message",
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
