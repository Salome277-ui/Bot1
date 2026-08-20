const { EmbedBuilder } = require('discord.js');
const { getCustomCommands } = require('../data/storage');

module.exports = async function messageCreate(client, message) {
    if (message.author.bot) return;
    if (!message.content) return;

    const customCommands = getCustomCommands();
    const trigger = message.content.trim().toLowerCase();
    const command = customCommands[trigger];

    if (!command) return;

    const embed = new EmbedBuilder()
        .setTitle(command.title)
        .setDescription(command.description)
        .setColor('#5865F2');

    await message.reply({ embeds: [embed] });
};
