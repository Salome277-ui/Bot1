const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('auto-roles')
        .setDescription('Crea un mensaje de auto-roles con botones (máximo 5)'),

    async execute(interaction) {
        const { buildAutoRolesModal } = require('../interfaces/modals');
        await interaction.showModal(buildAutoRolesModal());
    }
};
