const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const { PASTEL_RED, ZAPE_GIF, ZAPE_EMOJI } = require('../data/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zape')
        .setDescription('Dale un zape a alguien')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('La persona a la que le darás el zape')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const invoker = interaction.user;

        const embed = new EmbedBuilder()
            .setColor(PASTEL_RED)
            .setImage(ZAPE_GIF);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`zape_devolver_${invoker.id}_${target.id}`)
                .setLabel('Devolver zape')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            content: `<@${invoker.id}> Le ha dado un zape a <@${target.id}> ${ZAPE_EMOJI}`,
            embeds: [embed],
            components: [row]
        });
    }
};
