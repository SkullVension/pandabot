import Counting from "../../models/Counting.js";
import Profile from "../../models/Profile.js";

export default async (client, member) => {
  if (!member || !member.id) return;

  try {
    await Counting.findOneAndDelete({ userId: member.id });
    await Profile.findOneAndDelete({ userId: member.id });
  } catch (err) {
    console.error(
      "Error removing MongoDB documents on guildMemberRemove:",
      err,
    );
  }
};
