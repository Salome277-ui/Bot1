const { EmbedBuilder } = require('discord.js');
const { ANUNCIO_EMOJI } = require('../../data/constants');

function isValidHexColor(value) {
    return /^#?[0-9A-Fa-f]{6}$/.test(value);
}

function normalizeHex(value) {
    return value.startsWith('#') ? value : `#${value}`;
}

module.exports = async function modalHandlers1(interaction) {
    const { customId } = interaction;

    if (customId.startsWith('embed_modal_')) {
        const mentionId = customId.replace('embed_modal_', '');
        const title = interaction.fields.getTextInputValue('embed_title');
        const text = interaction.fields.getTextInputValue('embed_text');
        const image = interaction.fields.getTextInputValue('embed_image');
        const author = interaction.fields.getTextInputValue('embed_author');
        let color = interaction.fields.getTextInputValue('embed_color');

        const embed = new EmbedBuilder().setTitle(title).setDescription(text);

        if (image) embed.setImage(image);
        if (author) embed.setAuthor({ name: author });

        if (color) {
            color = normalizeHex(color.trim());
            embed.setColor(isValidHexColor(color) ? color : '#5865F2');
        } else {
            embed.setColor('#5865F2');
        }

        const messagePayload = { embeds: [embed] };
        if (mentionId !== 'none') {
            messagePayload.content = `<@${mentionId}>`;
        }

        await interaction.reply(messagePayload);
        return true;
    }

    if (customId === 'anuncio_modal') {
        const title = interaction.fields.getTextInputValue('anuncio_title');
        const desc = interaction.fields.getTextInputValue('anuncio_desc');
        const image = interaction.fields.getTextInputValue('anuncio_image');
        const channelId = interaction.fields.getTextInputValue('anuncio_channel');

        let targetChannel;
        try {
            targetChannel = await interaction.client.channels.fetch(channelId);
        } catch (err) {
            targetChannel = null;
        }

        if (!targetChannel || !targetChannel.isTextBased()) {
            await interaction.reply({
                content: 'No pude encontrar ese canal. Revisa el ID e inténtalo de nuevo.',
                ephemeral: true
            });
            return true;
        }

        const embed = new EmbedBuilder().setTitle(title).setDescription(desc).setColor('#FF0000');
        if (image) embed.setImage(image);

        await targetChannel.send({
            content: `📢 ANUNCIO IMPORTANTE!!!! ${ANUNCIO_EMOJI}`,
            embeds: [embed]
        });

        await interaction.reply({
            content: `Anuncio enviado correctamente en <#${channelId}>.`,
            ephemeral: true
        });
        return true;
    }

    return false;
};
