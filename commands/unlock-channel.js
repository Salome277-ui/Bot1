const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PASTEL_GREEN } = require('../data/constants');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('unlock-channel')
        .setDescription('Vuelve a abrir el canal actual'),

    async execute(interaction) {
        const channel = interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;

        try {
            await channel.permissionOverwrites.delete(everyoneRole);

            let newName = channel.name;
            if (newName.startsWith('nurse-lock-')) {
                newName = newName.replace('nurse-lock-', '');
                await channel.setName(newName);
            }

            const embed = new EmbedBuilder()
                .setColor(PASTEL_GREEN)
                .setTitle('🔓 Canal abierto')
                .setDescription('Ya se puede volver a escribir, enviar archivos y crear hilos en este canal.');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error desbloqueando el canal:', error);
            await interaction.reply({
                content: 'No pude abrir el canal. Revisa que el bot tenga el permiso "Manage Channels" y "Manage Roles".',
                ephemeral: true
            });
        }
    }
};
