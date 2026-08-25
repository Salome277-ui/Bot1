const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { PASTEL_RED } = require('../data/constants');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('lock-channels')
        .setDescription('Bloquea TODOS los canales de texto del servidor'),

    async execute(interaction) {
        await interaction.deferReply();

        const everyoneRole = interaction.guild.roles.everyone;
        const textChannels = interaction.guild.channels.cache.filter(
            channel => channel.type === ChannelType.GuildText
        );

        for (const channel of textChannels.values()) {
            try {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    SendMessages: false,
                    SendMessagesInThreads: false,
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false,
                    AttachFiles: false
                });

                if (!channel.name.startsWith('nurse-lock-')) {
                    await channel.setName(`nurse-lock-${channel.name}`);
                }
            } catch (error) {
                console.error(`No se pudo bloquear el canal ${channel.name}:`, error);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(PASTEL_RED)
            .setDescription('🔒Todos los canales han sido bloqueado!!');

        await interaction.editReply({ embeds: [embed] });
    }
};
