const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('anuncio')
        .setDescription('Envía un anuncio a un canal'),

    async execute(interaction) {
        // La interfaz (modal) se abre desde interactionCreate.js
        // porque showModal debe llamarse directamente desde la interacción.
        const { buildAnuncioModal } = require('../interfaces/modals');
        await interaction.showModal(buildAnuncioModal());
    }
};
