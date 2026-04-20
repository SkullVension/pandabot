const { EmbedBuilder } = require("discord.js");
const { serverConfig } = require("../../../config.json");
const { deleteDocument, getDocument } = require("../../utils/firestore");

module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  if (message.channel.id !== serverConfig.suspendedChannel) return;
  // check if the user have finished their suspended duration, if so, unsuspnd them

  const suspendedRole = message.guild.roles.cache.get(
    serverConfig.suspendedRoleId,
  );
  if (!suspendedRole) return;

  const member = message.guild.members.cache.get(message.author.id);
  if (!member) return;
  const suspensionDoc = await getDocument("suspensions", member.id);

  if (!suspensionDoc.exists()) return;
  const suspension = suspensionDoc.data();
  if (
    !suspension ||
    !suspension.moderatorId ||
    !suspension.reason ||
    !suspension.duration
  )
    return;

  // check if today's date is passed suspension.duration, if so, unsuspend
  const now = Date.now();

  const suspensionEnd = new Date(suspension.duration).getTime();
  if (isNaN(suspensionEnd)) {
    console.error("Invalid suspension duration format for user:", member.id);
    return;
  }

  if (now < suspensionEnd) return;

  try {
    await member.roles.remove(suspendedRole, "Suspension duration ended");
    await deleteDocument("suspensions", member.id);
    const embed = new EmbedBuilder()
      .setTitle("User Unsuspended")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "Unsuspended User",
          value: `${member.user}`,
          inline: true,
        },
        { name: "Reason", value: "Suspension duration ended", inline: false },
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
      .setTimestamp();

    const logChannel = message.guild.channels.cache.get(
      serverConfig.modLogChannel,
    );

    message.channel.send({ embeds: [embed] });
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error unsuspending user:", error);
    await message.channel.send(
      `There was an error unsuspending ${member}. Please try again.`,
    );
  }
};
