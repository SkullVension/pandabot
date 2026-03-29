const Profile = require("../../models/Profile");

module.exports = {
  callback: async (client, interaction) => {
    if (interaction.user.bot) return;

    const bio = interaction.options.getString("bio");
    const country = interaction.options.getString("country");
    const age = interaction.options.getInteger("age");
    const github = interaction.options.getString("github");
    const portfolio = interaction.options.getString("portfolio");
    const stack = interaction.options.getString("stack");
    const hobbies = interaction.options.getString("hobbies");

    let profile = await Profile.findOne({ userId: interaction.user.id });

    if (!profile) {
      profile = new Profile({ userId: interaction.user.id });
    }

    if (bio !== null) profile.bio = bio;
    if (country !== null) profile.country = country;
    if (age !== null) profile.age = age;
    if (github !== null) profile.github = github;
    if (portfolio !== null) profile.portfolio = portfolio;
    if (stack !== null) profile.stack = stack;
    if (hobbies !== null) profile.hobbies = hobbies;

    await profile.save();

    await interaction.reply({
      content: "✅ Profile updated.",
      ephemeral: true,
    });
  },

  name: "edit-profile",
  description: "Edit your profile",

  options: [
    { name: "bio", description: "Your bio", type: 3, required: false },
    { name: "country", description: "Your country", type: 3, required: false },
    { name: "age", description: "Your age", type: 4, required: false },
    {
      name: "stack",
      description: "Your development stack",
      type: 3,
      required: false,
    },
    {
      name: "github",
      description: "GitHub profile link",
      type: 3,
      required: false,
    },
    {
      name: "portfolio",
      description: "Portfolio link",
      type: 3,
      required: false,
    },
    {
      name: "hobbies",
      description: "Your hobbies",
      type: 3,
      required: false,
    },
  ],
};
