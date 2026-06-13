export default async (client, member) => {
  if (!member || !member.id) return;

  try {
    const guildName = member.guild?.name || "the server";
    const mention = member.user?.toString() || `<@${member.id}>`;

    const dmContent = `Hello ${mention}, 👋

Welcome to **${guildName}**, we're glad to have you here.

This community is a space for people who enjoy building, learning, and solving problems together. Whether you're just starting out or already experienced, you'll find others here to connect with and learn from.

Feel free to:
- Share projects you're working on or ideas you're developing
- Ask for help if you run into issues or get stuck
- Contribute knowledge or insights in discussions
- Collaborate and exchange ideas with other members
- Explore tools, technologies, and best practices together

Take some time to look around and get familiar with the channels. If you need anything or have questions, don't hesitate to ask.
Welcome aboard, we’re looking forward to seeing what you create 🚀
`;

    // attempt to dm tha new member, users may have dms from server members disabled
    await member.user.send({ content: dmContent }).catch((err) => {
      const msg = `Could not send welcome DM to ${
        member.user.tag || member.id
      }: ${err?.message || err}`;
      if (client?.logger?.info) client.logger.info(msg);
      else console.warn(msg);
    });
  } catch (err) {
    console.error("Error sending welcome DM on guildMemberAdd:", err);
  }
};
