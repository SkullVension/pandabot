import SuspendedMember from "../../models/SuspendedMember.js";

export default async (client, member) => {
  try {
    const record = await SuspendedMember.findOne({
      userId: member.id,
      guildId: member.guild.id
    });

    if (!record) return;

    const suspendedRole = member.guild.roles.cache.get(record.roleId);
    if (!suspendedRole) return;

    await member.roles.add(suspendedRole, "Evaded suspension by leaving and rejoining.");
  } catch (error) {
    console.error("Error checking persistent suspension:", error);
  }
};