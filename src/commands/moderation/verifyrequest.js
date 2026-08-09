import { createCaptchaSync } from "captcha-canvas";
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits
} from "discord.js";
import data from "../../../config.json" with { type: "json" };
import SuspendedMember from "../../models/SuspendedMember.js";
import Verification from "../../models/Verification.js";

const { serverConfig } = data;

export default {
  callback: async (client, interaction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const optMember = interaction.options.getMember("target-user");
    const suspendedRole = interaction.guild.roles.cache.get(serverConfig.suspendedRoleId);    
    
    if (!optMember) return interaction.editReply("That member does not exist.");
    if (!suspendedRole) return interaction.editReply("Suspended role is not configured correctly.");
    if (optMember.roles.cache.has(suspendedRole.id)) return interaction.editReply("User is already under verification.");

    const { image: imageBuffer, text: captchaText } = createCaptchaSync(350, 120, {
    captcha: {
      characters: 6,
      size: 50,
      color: "#5865f2",
      skew: true
  },
     decoy: { opacity: 0.3, total: 20 },
     trace: { color: "#ed4245", size: 3, opacity: 0.5 }
});
    
    const attachment = new AttachmentBuilder(imageBuffer, { name: "captcha.png" });

    try {
      await SuspendedMember.findOneAndUpdate(
        { guildId: interaction.guild.id, userId: optMember.id },
        { guildId: interaction.guild.id, userId: optMember.id, roleId: suspendedRole.id },
        { upsert: true, new: true }
      );
      
      await Verification.findOneAndUpdate(
        { guildId: interaction.guild.id, userId: optMember.id },
        { guildId: interaction.guild.id, userId: optMember.id, captchaAnswer: captchaText.toLowerCase() },
        { upsert: true }
      );


      await optMember.roles.add(suspendedRole, "Manual Verification Request");
      const dmEmbed = new EmbedBuilder()
  .setTitle("🔒 Account Verification Required")
  .setDescription(`A moderator has requested verification for your profile in **${interaction.guild.name}**.\n\nPlease type the distorted characters displayed in the image below into this chat to restore access:\n\n*(Case-insensitive. Expires in 1 hour)*`)
  .setColor("#ed4245")
  .setImage("attachment://captcha.png")
  .setTimestamp();
        let dmSent = true;
      await optMember.send({ embeds: [dmEmbed], files: [attachment] }).catch(() => {
        dmSent = false;
  });
        if (!dmSent) {
      await interaction.editReply({
    content: `⚠️ Appended restriction role, but **could not DM** **${optMember.user.tag}** (DMs are closed!).`,
});
    return;
}
    await interaction.editReply(`Done! Sent a CAPTCHA verification challenge to **${optMember.user.tag}**.`);
} catch (err) {
    console.error(err);
    await optMember.roles.remove(suspendedRole, "Verification setup failed").catch(() => {});
    await interaction.editReply("An internal configuration error occurred.");
  }
  },
  name: "verify-request",
  description: "Force a user to complete an official visual image verification check.",
  options: [
    {
      name: "target-user",
      description: "The suspicious account profile.",
      type: ApplicationCommandOptionType.User,
      required: true,
    }
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.ManageRoles],
};
