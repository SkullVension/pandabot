import { EmbedBuilder } from "discord.js";
import data from "../../../config.json" with { type: "json" };

const { serverConfig } = data;

export default {
  name: "ticketinfo",
  description: "Provides information about tickets.",
  alias: ["ticketsinfo", "ticketinginfo"],
  callback: (client, message, args) => {
    try {
      const ticketChannelId = serverConfig.ticketChannel;
      const ticketInfo = `Tickets are the best way to get help and ensure moderators can respond quickly. Here’s what you can use them for:
- 🧩 General Support: For questions, technical issues, or anything else you need assistance with, tickets help us track and resolve them.
- 🎭 Request Unban / Unmute: If you or a friend need to appeal a ban, mute or suspend, open a ticket and provide the details.
- 🚨 Report User: If you need to report someone, tickets make sure the moderators see it right away and can investigate properly.
- ⚒️ Apply For Staff: Interested in joining our moderation team? Use a ticket to submit your application and tell us why you’d be a great fit.
- 📝 Other: For any other reasons, open a ticket and explain your situation.

To open a ticket, go to <#${ticketChannelId}> and use the dropdown menu to select your ticket type. You’ll be guided through a simple form to explain your reason. I will handle the process, create a private channel for your case, and keep everything neat and secure. Thanks for helping us keep the community clean ✨`;

      const embed = new EmbedBuilder()
        .setTitle("📘 Ticket Guide")
        .setDescription(ticketInfo.trim())
        .setColor(0x5865f2)
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    } catch (err) {}
  },
};
