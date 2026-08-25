const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

function buildEmbedModal() {
    const modal = new ModalBuilder()
        .setCustomId('embed_modal')
        .setTitle('Crear embed');

    const title = new TextInputBuilder()
        .setCustomId('embed_title')
        .setLabel('Título')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const text = new TextInputBuilder()
        .setCustomId('embed_text')
        .setLabel('Texto (descripción)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const image = new TextInputBuilder()
        .setCustomId('embed_image')
        .setLabel('URL de imagen (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    const author = new TextInputBuilder()
        .setCustomId('embed_author')
        .setLabel('Autor (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    const color = new TextInputBuilder()
        .setCustomId('embed_color')
        .setLabel('Color del embed (código hex, ej: #FF0000)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('#5865F2');

    modal.addComponents(
        new ActionRowBuilder().addComponents(title),
        new ActionRowBuilder().addComponents(text),
        new ActionRowBuilder().addComponents(image),
        new ActionRowBuilder().addComponents(author),
        new ActionRowBuilder().addComponents(color)
    );

    return modal;
}

function buildAnuncioModal() {
    const modal = new ModalBuilder()
        .setCustomId('anuncio_modal')
        .setTitle('Enviar anuncio');

    const title = new TextInputBuilder()
        .setCustomId('anuncio_title')
        .setLabel('Título')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const desc = new TextInputBuilder()
        .setCustomId('anuncio_desc')
        .setLabel('Descripción')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const image = new TextInputBuilder()
        .setCustomId('anuncio_image')
        .setLabel('URL de imagen (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    const channelId = new TextInputBuilder()
        .setCustomId('anuncio_channel')
        .setLabel('ID del canal donde enviarlo')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(title),
        new ActionRowBuilder().addComponents(desc),
        new ActionRowBuilder().addComponents(image),
        new ActionRowBuilder().addComponents(channelId)
    );

    return modal;
}

function buildGiveawayModal() {
    const modal = new ModalBuilder()
        .setCustomId('giveaway_modal')
        .setTitle('Crear giveaway');

    const title = new TextInputBuilder()
        .setCustomId('giveaway_title')
        .setLabel('Título')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const desc = new TextInputBuilder()
        .setCustomId('giveaway_desc')
        .setLabel('Descripción')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const image = new TextInputBuilder()
        .setCustomId('giveaway_image')
        .setLabel('URL de imagen (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(title),
        new ActionRowBuilder().addComponents(desc),
        new ActionRowBuilder().addComponents(image)
    );

    return modal;
}

function buildPersonalizadoModal() {
    const modal = new ModalBuilder()
        .setCustomId('personalizado_modal')
        .setTitle('Crear comando personalizado');

    const trigger = new TextInputBuilder()
        .setCustomId('personalizado_trigger')
        .setLabel('Texto que activa el comando')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const desc = new TextInputBuilder()
        .setCustomId('personalizado_desc')
        .setLabel('Descripción')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(trigger),
        new ActionRowBuilder().addComponents(desc)
    );

    return modal;
}

function buildEatOrLeaveModal() {
    const modal = new ModalBuilder()
        .setCustomId('eatleave_modal')
        .setTitle('Crear Eat or Leave');

    const desc = new TextInputBuilder()
        .setCustomId('eatleave_desc')
        .setLabel('Descripción')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const image = new TextInputBuilder()
        .setCustomId('eatleave_image')
        .setLabel('URL de imagen (opcional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(desc),
        new ActionRowBuilder().addComponents(image)
    );

    return modal;
}

function buildAutoRolesModal() {
    const modal = new ModalBuilder()
        .setCustomId('autoroles_modal')
        .setTitle('Crear Auto-Roles');

    const desc = new TextInputBuilder()
        .setCustomId('autoroles_desc')
        .setLabel('Descripción')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(desc));

    return modal;
}

function buildAutoRoleAddModal(messageId) {
    const modal = new ModalBuilder()
        .setCustomId(`autorole_add_modal_${messageId}`)
        .setTitle('Agregar botón de rol');

    const emoji = new TextInputBuilder()
        .setCustomId('autorole_emoji')
        .setLabel('Emoji para el botón')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('🎮');

    const role = new TextInputBuilder()
        .setCustomId('autorole_role')
        .setLabel('Rol (menciona el rol o pega su ID)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('@Rol o 1234567890123456');

    modal.addComponents(
        new ActionRowBuilder().addComponents(emoji),
        new ActionRowBuilder().addComponents(role)
    );

    return modal;
}

module.exports = {
    buildEmbedModal,
    buildAnuncioModal,
    buildGiveawayModal,
    buildPersonalizadoModal,
    buildEatOrLeaveModal,
    buildAutoRolesModal,
    buildAutoRoleAddModal
};
