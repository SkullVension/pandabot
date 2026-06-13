import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

import data from "../../config.json" with { type: "json" };
import buildModal from "../utils/buildModal.js";
import buildTicketTranscript from "../utils/buildTicketTranscript.js";

const { serverConfig } = data;

export default {
  id: "close_ticket",
  callback: async (client, interaction) => {
    const { database, transcripts } = serverConfig.tickets;
    const { moderatorRoleId } = serverConfig;

    const member = interaction.member;
    const isOpener = interaction.message.embeds[0]?.footer?.text?.includes(
      interaction.user.id,
    );
    const isModerator =
      moderatorRoleId && member.roles.cache.has(moderatorRoleId);
    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isOpener && !isModerator && !isAdmin) {
      await interaction.reply({
        content: "You are not allowed to close this ticket.",
        ephemeral: true,
      });
      return;
    }

    const closeModalId = `close_ticket_modal_${interaction.user.id}_${Date.now()}`;
    const closeModal = buildModal(client, {
      customId: closeModalId,
      title: "Close Ticket",
      fields: [
        {
          customId: "reason",
          label: "Reason",
          style: "PARAGRAPH",
          placeholder: "Explain why this ticket is being closed (optional)",
          required: false,
          maxLength: 1024,
        },
      ],
    });

    try {
      await interaction.showModal(closeModal);
    } catch (err) {
      console.error("Failed to show close modal:", err);
      await interaction
        .reply({
          content: "Failed to open close form. Please try again.",
          ephemeral: true,
        })
        .catch(() => {});
      return;
    }

    let closeSubmit;
    try {
      closeSubmit = await interaction.awaitModalSubmit({
        filter: (m) =>
          m.user.id === interaction.user.id && m.customId === closeModalId,
        time: 300000,
      });
    } catch (err) {
      console.error("Close modal submit error or timeout:", err);
      await interaction
        .followUp({
          content: "You did not submit the close form in time.",
          ephemeral: true,
        })
        .catch(() => {});
      return;
    }

    const closeReason = closeSubmit.fields.getTextInputValue("reason") || "";

    await closeSubmit
      .reply({ content: "Closing ticket...", ephemeral: true })
      .catch(() => {});

    const safeName = interaction.channel.name;

    const id = safeName.split("-")[1];

    // transcript
    try {
      const databaseChannel = await client.channels.fetch(database);
      const transcriptsChannel = await client.channels.fetch(transcripts);

      const fetchedMessages = await interaction.channel.messages.fetch({
        limit: 100,
      });
      const sortedMessages = fetchedMessages.sort(
        (a, b) => a.createdTimestamp - b.createdTimestamp,
      );

      const messagesData = [];
      for (const msg of sortedMessages.values()) {
        if (msg.author.bot) continue; // exclude bot messages
        const attachments = [];
        for (const attach of msg.attachments.values()) {
          if (attach.contentType?.startsWith("image/")) {
            const sent = await databaseChannel.send({
              files: [
                {
                  attachment: attach.url,
                  name: attach.name || "image.png",
                },
              ],
            });
            attachments.push(sent.attachments.first().url);
          }
        }
        messagesData.push({
          id: msg.id,
          authorId: msg.author.id,
          content: msg.content,
          timestamp: msg.createdTimestamp,
          attachments,
          reference: msg.reference,
        });
      }

      const html = await buildTicketTranscript(client, messagesData);
      await transcriptsChannel.send({
        content: `Ticket ID: ${id}`,
        files: [
          {
            attachment: Buffer.from(html),
            name: `transcript-${safeName}.html`,
          },
        ],
      });
    } catch (e) {
      console.error("Failed to generate transcript:", e);
    }

    try {
      await interaction.channel.delete(
        `Ticket closed by ${interaction.user.tag}`,
      );
      const dmContent = new EmbedBuilder()
        .setTitle("Ticket Closed")
        .setDescription(
          `Your ticket "${safeName}" has been closed. If you have further questions, feel free to open a new ticket.`,
        )
        .setFields(
          // partnership-xxxxx -> partnership, slice off the id
          { name: "Type", value: safeName.split("-")[0], inline: true },
          { name: "ID", value: id, inline: true },
          {
            name: "Closed By",
            value: interaction.user.toString(),
            inline: true,
          },

          {
            name: "Reason",
            value: closeReason || "No reason provided",
            inline: false,
          },
        )
        .setColor(0x11ee11)
        .setFooter({
          text: `Closed at ${new Date().toLocaleString()}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      const opener = await client.users.fetch(
        interaction.message.embeds[0].footer.text,
      );

      await opener.send({ embeds: [dmContent] }).catch(() => {});
    } catch (e) {
      console.error("Failed to delete ticket channel:", e);
    }
  },
};
