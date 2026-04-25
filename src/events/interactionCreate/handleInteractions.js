const getAllFiles = require("../../utils/getAllFiles");
const path = require("path");

const interactions = [];
const interactionFiles = getAllFiles(
  path.join(__dirname, "..", "..", "interactions"),
);
for (const file of interactionFiles) {
  const command = require(file);
  interactions.push(command);
}

module.exports = async (client, interaction) => {
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
