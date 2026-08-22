const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWarns, saveWarns } = require('../data/storage');
const { PASTEL_RED, WARN_EMOJI } = require('../data/constants');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Da un warn a un usuario')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario que recibirá el warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('razon')
                .setDescription('Razón del warn')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');
        const guildId = interaction.guildId;

        const warns = getWarns();
        if (!warns[guildId]) warns[guildId] = {};
        if (!warns[guildId][target.id]) warns[guildId][target.id] = 0;

        warns[guildId][target.id] += 1;
        saveWarns(warns);

        const count = warns[guildId][target.id];

        const embed = new EmbedBuilder()
            .setColor(PASTEL_RED)
            .setDescription(
                `**Razon:** ${razon}\n\nhaz recibido ${count}/3 Warns`
            );

        await interaction.reply({
            content: `<@${target.id}> haz recibido un warn ${WARN_EMOJI}`,
            embeds: [embed]
        });
    }
};
