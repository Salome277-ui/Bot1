const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require('discord.js');
const { PASTEL_PINK } = require('../data/constants');
const { parseEmoji } = require('../utils/emoji');

const PANEL_DESCRIPTION = [
    '# <a:lazo:1533270880673595402> 𝗍іᥴkᥱ𝗍s꒱꒱ ⑅ .ᐟ',
    '𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟',
    '⪩⪨    :Toca uno de los botones de  acuerdo a tu situation.ᐟ<:Nurse:1523126016057413763>',
    '𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟'
].join('\n');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-ticket')
        .setDescription('Envía el panel de tickets a un canal')
        .addChannelOption(option =>
            option
                .setName('canal')
                .setDescription('Canal donde se enviará el panel de tickets')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');

        const embed = new EmbedBuilder()
            .setColor(PASTEL_PINK)
            .setDescription(PANEL_DESCRIPTION);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_open_reporte')
                .setLabel('Reporte/queja')
                .setEmoji(parseEmoji('<:med_kit:1524953224224837813>'))
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ticket_open_recompensas')
                .setLabel('Recompensas')
                .setEmoji(parseEmoji('<:kit_syringe:1524951861520760862>'))
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ticket_open_alianzas')
                .setLabel('Alianzas')
                .setEmoji(parseEmoji('<a:patita:1540515775302074478>'))
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ticket_open_otro')
                .setLabel('Otro')
                .setEmoji(parseEmoji('<a:corazn2:1533270944204849264>'))
                .setStyle(ButtonStyle.Secondary)
        );

        try {
            await channel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error enviando el panel de tickets:', error);
            return interaction.reply({
                content: 'No pude enviar el panel a ese canal. Revisa que el bot tenga permisos ahí.',
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `✅ Panel de tickets enviado en <#${channel.id}>.`,
            ephemeral: true
        });
    }
};
