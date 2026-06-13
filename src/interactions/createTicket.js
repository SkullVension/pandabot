import crypto from "crypto";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import data from "../../config.json" with { type: "json" };
import buildModal from "../utils/buildModal.js";

const { serverConfig } = data;

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

function getSelectedOption(ticketType) {
  return selectMenu.find((option) => option.value === ticketType);
}

export default {
  id: "ticket_type_select",
  callback: async (client, interaction) => {
    if (interaction.user.bot) return;

    const ticketType = interaction.values[0];
    const selectedOption = getSelectedOption(ticketType);
    const ticketLabel = ticketType;
    const id = crypto.randomBytes(4).toString("hex");

    const modalId = `ticket_modal_${interaction.user.id}_${Date.now()}`;
    const modal = buildModal(client, {
      customId: modalId,
      title: "Open a Ticket",
      fields: selectedOption
        ? selectedOption.fields
        : [
            {
              customId: "reason",
              label: "Reason",
              style: "PARAGRAPH",
              placeholder:
                "Explain why you are opening this ticket (max 1024 chars)",
              required: true,
              maxLength: 1024,
            },
          ],
    });

    try {
      await interaction.showModal(modal);
    } catch (err) {
      console.error("Failed to show modal:", err);
      await interaction.reply({
        content: "Something went wrong showing the form. Please try again.",
        ephemeral: true,
      });
      return;
    }

    let modalSubmit;
    try {
      modalSubmit = await interaction.awaitModalSubmit({
        filter: (i) =>
          i.user.id === interaction.user.id && i.customId === modalId,
        time: 300000,
      });
    } catch (e) {
      console.error("Modal submit error or timeout:", e);
      await interaction.followUp({
        content: "You did not submit the ticket form in time.",
        ephemeral: true,
      });
      return;
    }

    await modalSubmit.deferReply({ ephemeral: true });

    const safeName = `${ticketLabel}-${id}`;

    const overwrites = [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ];

    if (serverConfig.moderatorRoleId) {
      overwrites.push({
        id: serverConfig.moderatorRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      });
    }

    let ticketChannel;
    try {
      ticketChannel = await interaction.guild.channels.create({
        name: safeName,
        type: ChannelType.GuildText,
        parent: serverConfig.tickets.category ?? undefined,
        topic: ticketLabel,
        permissionOverwrites: overwrites,
      });
    } catch (err) {
      console.error("Failed creating ticket channel:", err);
      await modalSubmit.reply({
        content: "Failed to create ticket channel. Please contact an admin.",
        ephemeral: true,
      });
      return;
    }

    const ticketEmbed = new EmbedBuilder()
      .setTitle("Ticket Created")
      .addFields(
        {
          name: "By",
          value: interaction.user.toString(),
          inline: true,
        },
        {
          name: "Type",
          value: selectedOption?.label ?? ticketType,
          inline: true,
        },
        {
          name: "Created At",
          value: `<t:${Math.floor(new Date().getTime() / 1000)}:F>`,
          inline: true,
        },
        ...(selectedOption?.fields || []).map((field) => ({
          name: field.label,
          value: modalSubmit.fields.getTextInputValue(field.customId) || "N/A",
          inline: false,
        })),
      )
      .setFooter({
        text: `${interaction.user.id}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Danger);
    const actionRow = new ActionRowBuilder().addComponents(closeButton);

    const posted = await ticketChannel.send({
      content: `${interaction.user} <@&${serverConfig.tickets.ticketsAdminId}>`,
      embeds: [ticketEmbed],
      components: [actionRow],
    });
    try {
      await posted.pin();
    } catch (e) {
      // ignore
    }

    await modalSubmit.editReply({
      content: `Ticket created: ${ticketChannel}`,
    });
  },
};
