const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGiveaways, saveGiveaways } = require('../data/storage');
const { GIVEAWAY_EMOJI } = require('../data/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('win')
        .setDescription('Elige un ganador al azar de un giveaway')
        .addStringOption(option =>
            option
                .setName('id_mensaje')
                .setDescription('ID del mensaje del giveaway (opcional, usa el más reciente si no se pone)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const giveaways = getGiveaways();
        const ids = Object.keys(giveaways);

        if (ids.length === 0) {
            return interaction.reply({
                content: 'No hay ningún giveaway creado todavía.',
                ephemeral: true
            });
        }

        const specifiedId = interaction.options.getString('id_mensaje');
        let giveawayId = specifiedId;

        if (!giveawayId) {
            // Tomar el giveaway creado más recientemente
            giveawayId = ids.sort(
                (a, b) => giveaways[b].createdAt - giveaways[a].createdAt
            )[0];
        }

        const giveaway = giveaways[giveawayId];

        if (!giveaway) {
            return interaction.reply({
                content: 'No encontré ese giveaway. Revisa el ID del mensaje.',
                ephemeral: true
            });
        }

        if (!giveaway.participants || giveaway.participants.length === 0) {
            return interaction.reply({
                content: 'Ese giveaway no tiene participantes todavía.',
                ephemeral: true
            });
        }

        const winnerId =
            giveaway.participants[
                Math.floor(Math.random() * giveaway.participants.length)
            ];

        const embed = new EmbedBuilder()
            .setTitle(`FELICIDADES!!! Has ganado el Giveaway ${GIVEAWAY_EMOJI}`)
            .setDescription(`Giveaway: **${giveaway.title}**`)
            .setColor('#F1C40F');

        giveaway.ended = true;
        giveaway.winnerId = winnerId;
        giveaways[giveawayId] = giveaway;
        saveGiveaways(giveaways);

        await interaction.reply({
            content: `<@${winnerId}>`,
            embeds: [embed]
        });
    }
};
