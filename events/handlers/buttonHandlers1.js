const { EmbedBuilder } = require('discord.js');
const { buildEmbedModal, buildGiveawayModal } = require('../../interfaces/modals');
const { getGiveaways, saveGiveaways } = require('../../data/storage');
const { PASTEL_RED, ZAPE_GIF, ZAPE_EMOJI } = require('../../data/constants');

module.exports = async function buttonHandlers1(interaction) {
    const { customId } = interaction;

    if (customId.startsWith('embed_crear_')) {
        const mentionId = customId.replace('embed_crear_', '');
        await interaction.showModal(buildEmbedModal(mentionId));
        return true;
    }
    if (customId === 'embed_cancelar') {
        await interaction.update({ content: 'Creación de embed cancelada.', components: [] });
        return true;
    }

    if (customId === 'giveaway_crear') {
        await interaction.showModal(buildGiveawayModal());
        return true;
    }
    if (customId === 'giveaway_cancelar') {
        await interaction.update({ content: 'Creación de giveaway cancelada.', components: [] });
        return true;
    }

    if (customId.startsWith('giveaway_participar_')) {
        const messageId = customId.replace('giveaway_participar_', '');
        const giveaways = await getGiveaways();
        const giveaway = giveaways[messageId];

        if (!giveaway) {
            await interaction.reply({ content: 'Este giveaway ya no está disponible.', ephemeral: true });
            return true;
        }
        if (giveaway.ended) {
            await interaction.reply({ content: 'Este giveaway ya terminó.', ephemeral: true });
            return true;
        }
        if (!giveaway.participants.includes(interaction.user.id)) {
            giveaway.participants.push(interaction.user.id);
            giveaways[messageId] = giveaway;
            await saveGiveaways(giveaways);
        }
        await interaction.reply({
            content: `Felicidades haz participado!! Eres uno de los ${giveaway.participants.length} que han participado`,
            ephemeral: true
        });
        return true;
    }

    if (customId.startsWith('zape_devolver_')) {
        const [, , invokerId, targetId] = customId.split('_');
        if (interaction.user.id !== targetId) {
            await interaction.reply({ content: 'No puedes realizar esta acción.', ephemeral: true });
            return true;
        }
        const embed = new EmbedBuilder().setColor(PASTEL_RED).setImage(ZAPE_GIF);
        await interaction.reply({
            content: `<@${targetId}> Le ha dado un zape a <@${invokerId}> ${ZAPE_EMOJI}`,
            embeds: [embed]
        });
        return true;
    }

    return false;
};
