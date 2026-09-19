const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAfk, saveAfk } = require('../data/storage');
const { PASTEL_PINK } = require('../data/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Marca tu estado como ausente')
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Razón por la que estarás ausente')
                .setRequired(false)
        ),

    async execute(interaction) {
        const reason = interaction.options.getString('motivo') || 'AFK';
        const guildId = interaction.guildId;

        const afk = await getAfk();
        if (!afk[guildId]) afk[guildId] = {};

        afk[guildId][interaction.user.id] = {
            reason,
            since: Date.now()
        };
        await saveAfk(afk);

        const embed = new EmbedBuilder()
            .setColor(PASTEL_PINK)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(
                `**Estado ausente establecido.**\n\n**Motivo:** ${reason}\n\nAvisaré a quienes te mencionan. >w<`
            );

        await interaction.reply({ embeds: [embed] });
    }
};
