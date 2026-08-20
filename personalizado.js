const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('personalizado')
        .setDescription('Crea un comando personalizado que activa un embed al escribirlo'),

    async execute(interaction) {
        const { buildPersonalizadoModal } = require('../interfaces/modals');
        await interaction.showModal(buildPersonalizadoModal());
    }
};
