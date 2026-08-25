const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { PASTEL_GREEN } = require('../data/constants');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('unlock-channels')
        .setDescription('Desbloquea TODOS los canales de texto del servidor'),

    async execute(interaction) {
        await interaction.deferReply();

        const everyoneRole = interaction.guild.roles.everyone;
        const textChannels = interaction.guild.channels.cache.filter(
            channel => channel.type === ChannelType.GuildText
        );

        for (const channel of textChannels.values()) {
            try {
                await channel.permissionOverwrites.delete(everyoneRole);

                if (channel.name.startsWith('nurse-lock-')) {
                    await channel.setName(channel.name.replace('nurse-lock-', ''));
                }
            } catch (error) {
                console.error(`No se pudo desbloquear el canal ${channel.name}:`, error);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(PASTEL_GREEN)
            .setDescription('🔓Todos los canales han sido desbloqueado!!');

        await interaction.editReply({ embeds: [embed] });
    }
};
