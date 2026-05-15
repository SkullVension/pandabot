const Counting = require("../../models/Counting");
const Profile = require("../../models/Profile");

module.exports = async (client, member) => {
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
