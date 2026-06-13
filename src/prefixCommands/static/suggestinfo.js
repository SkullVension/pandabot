import { EmbedBuilder } from "discord.js";

export default {
  name: "suggestinfo",
  description: "Provides information about /suggest command.",
  aliases: ["suggestioninfo"],
  callback: (client, message, args) => {
    try {
      const suggestionInfo = `Use the \`/suggest\` command anywhere in the server to share ideas or improvements with the community.
### Command Syntax
\`/suggest <suggestion> [image]\`
- **suggestion** *(string, required)*: The idea or feedback you want to propose.
- **image** *(attachment, optional)*: An optional image to support your suggestion (recommended if available).
### What Happens Next
- The bot will post your suggestion in the suggestions channel.
- Reaction emojis will be automatically added for voting.
### Voting Reactions
- 👍 — **Upvote** (I support this!)
- 👎 — **Downvote** (Not a fan)
- 🤷 — **Neutral / Unsure**
- 🕒 — **Queue** (suggestion acknowledged, pending review)
- ✅ — **Implemented** (set by admins/mods when suggestion is applied)
- ❌ — **Rejected / Not possible**
### ℹ️ Extra Info
- 💬 You can **create a thread** under any suggestion to discuss details.
- 🛡️ Admins/mods may pin or highlight popular suggestions for visibility or keep as memory.
- 🚀 Be clear and concise. actionable suggestions get the most traction.
- 🎨 Images, mockups, or examples make your suggestion stronger and easier to understand.
- 🤝 Respect others’ ideas. constructive discussion only.

✨ *Your feedback shapes the community. Don’t hesitate to drop your ideas!*
`;

      const embed = new EmbedBuilder()
        .setTitle("📘 Suggestion Guide")
        .setDescription(suggestionInfo.trim())
        .setColor(0x5865f2)
        .setFooter({
          text: `Requested by ${message.author.tag} • Use /suggest to send your suggestion`,
          iconURL: message.author.displayAvatarURL(),
        });
      return message.reply({ embeds: [embed] });
    } catch (err) {}
  },
};
