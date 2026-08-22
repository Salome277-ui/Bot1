const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PASTEL_RED } = require('../data/constants');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('lock-channel')
        .setDescription('Bloquea el canal actual para que nadie pueda escribir'),

    async execute(interaction) {
        const channel = interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;

        try {
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false,
                SendMessagesInThreads: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false,
                AttachFiles: false
            });

            let newName = channel.name;
            if (!newName.startsWith('nurse-lock-')) {
                newName = `nurse-lock-${channel.name}`;
                await channel.setName(newName);
            }

            const embed = new EmbedBuilder()
                .setColor(PASTEL_RED)
                .setTitle('🔒 Canal cerrado')
                .setDescription('Nadie podrá escribir, enviar archivos ni crear hilos en este canal.');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error bloqueando el canal:', error);
            await interaction.reply({
                content: 'No pude bloquear el canal. Revisa que el bot tenga el permiso "Manage Channels" y "Manage Roles".',
                ephemeral: true
            });
        }
    }
};
