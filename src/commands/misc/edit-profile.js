import Profile from "../../models/Profile.js";

export default {
  callback: async (client, interaction) => {
    try {
      if (interaction.user.bot) return;

      let error;

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

      switch (true) {
        case bio !== null && (bio.length < 2 || bio.length > 200):
          error = "Bio must be between 2 and 200 characters.";
          break;
        case country !== null && (country.length < 2 || country.length > 100):
          error = "Country must be between 2 and 100 characters.";
          break;
        case age !== null && (age < 1 || age > 1000):
          error = "Age must be a number between 1 and 1000.";
          break;
        case stack !== null && (stack.length < 2 || stack.length > 200):
          error = "Stack must be between 2 and 200 characters.";
          break;
        case hobbies !== null && (hobbies.length < 2 || hobbies.length > 200):
          error = "Hobbies must be between 2 and 200 characters.";
          break;
        case github !== null &&
          !/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/.test(github):
          error = "GitHub link must be a valid GitHub profile URL.";
          break;
        case portfolio !== null && !/^https?:\/\/[^\s]+$/.test(portfolio):
          error = "Portfolio link must be a valid URL.";
          break;
      }

      if (error) {
        await interaction.reply({
          content: `❌ ${error}`,
          ephemeral: true,
        });
        return;
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
    } catch (error) {
      console.error("Error editing profile:", error);
      await interaction.reply({
        content:
          "❌ An error occurred while updating your profile, Please make sure your inputs are valid (e.g. age should be a number between 1 and 1000).",
        ephemeral: true,
      });
    }
  },

  name: "edit-profile",
  description: "Edit your profile",

  options: [
    {
      name: "bio",
      description: "Your bio",
      type: 3,
      required: false,
      min_length: 2,
      max_length: 200,
    },
    {
      name: "country",
      description: "Your country",
      type: 3,
      required: false,
      min_length: 2,
      max_length: 100,
    },
    {
      name: "age",
      description: "Your age",
      type: 4,
      required: false,
      min_value: 1,
      max_value: 1000,
    },
    {
      name: "stack",
      description: "Your development stack",
      type: 3,
      required: false,
      min_length: 2,
      max_length: 200,
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
      min_length: 2,
      max_length: 200,
    },
  ],
};
