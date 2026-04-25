const getAllFiles = require("../../utils/getAllFiles");
const path = require("path");

module.exports = async (client, interaction) => {
  const interactions = [];

  const interactionFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "interactions"),
  );

  for await (const file of interactionFiles) {
    const command = require(file);
    interactions.push(command);
  }

  try {
    const interactionObject = interactions.find(
      (cmd) => cmd.id === interaction.customId,
    );

    if (!interactionObject) return;

    await interactionObject.callback(client, interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
};
