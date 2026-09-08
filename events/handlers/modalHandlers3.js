const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getAutoRoles, saveAutoRoles } = require('../../data/storage');
const { PASTEL_RED } = require('../../data/constants');

function extractRoleId(text) {
    const mentionMatch = text.match(/^<@&(\d+)>$/);
    if (mentionMatch) return mentionMatch[1];
    const idMatch = text.match(/^\d+$/);
    if (idMatch) return text;
    return null;
}

function buildAutoRolesComponents(config) {
    const rows = [];
    let currentRow = new ActionRowBuilder();

    config.roles.forEach((r, index) => {
        if (index > 0 && index % 5 === 0) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
        }
        currentRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`autorole_click_${r.roleId}`)
                .setLabel(r.roleName || 'Rol')
                .setEmoji(r.emoji)
                .setStyle(ButtonStyle.Secondary)
        );
    });

    if (currentRow.components.length > 0) rows.push(currentRow);
    return rows;
}

module.exports = async function modalHandlers3(interaction) {
    const { customId } = interaction;

    if (customId === 'eatleave_modal') {
        const desc = interaction.fields.getTextInputValue('eatleave_desc');
        const image = interaction.fields.getTextInputValue('eatleave_image');

        const embed = new EmbedBuilder().setDescription(desc).setColor(PASTEL_RED);
        if (image) embed.setImage(image);

        await interaction.reply({ embeds: [embed] });

        const sentMessage = await interaction.fetchReply();
        await sentMessage.react('🇪');
        await sentMessage.react('🇱');

        return true;
    }

    if (customId === 'autoroles_modal') {
        const desc = interaction.fields.getTextInputValue('autoroles_desc');

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎭 Auto-Roles')
            .setDescription(desc);

        await interaction.reply({ embeds: [embed] });
        const sentMessage = await interaction.fetchReply();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`autorole_add_${sentMessage.id}`)
                .setLabel('➕ Agregar botón de rol')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.editReply({ components: [row] });

        const autoRoles = await getAutoRoles();
        autoRoles[sentMessage.id] = {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            description: desc,
            roles: []
        };
        await saveAutoRoles(autoRoles);

        return true;
    }

    if (customId.startsWith('autorole_add_modal_')) {
        const messageId = customId.replace('autorole_add_modal_', '');
        const emoji = interaction.fields.getTextInputValue('autorole_emoji').trim();
        const roleText = interaction.fields.getTextInputValue('autorole_role').trim();

        const roleId = extractRoleId(roleText);
        if (!roleId) {
            await interaction.reply({
                content: 'No entendí el rol. Menciona el rol (@rol) o pega su ID.',
                ephemeral: true
            });
            return true;
        }

        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            await interaction.reply({ content: 'No encontré ese rol en el servidor.', ephemeral: true });
            return true;
        }

        const autoRoles = await getAutoRoles();
        const config = autoRoles[messageId];

        if (!config) {
            await interaction.reply({
                content: 'Este mensaje de auto-roles ya no está disponible.',
                ephemeral: true
            });
            return true;
        }

        if (config.roles.length >= 5) {
            await interaction.reply({ content: 'Ya se alcanzó el máximo de 5 botones.', ephemeral: true });
            return true;
        }

        config.roles.push({ emoji, roleId: role.id, roleName: role.name });
        autoRoles[messageId] = config;
        await saveAutoRoles(autoRoles);

        const rows = buildAutoRolesComponents(config);
        if (config.roles.length < 5) {
            const lastRow = rows[rows.length - 1];
            if (lastRow && lastRow.components.length < 5) {
                lastRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`autorole_add_${messageId}`)
                        .setLabel('➕ Agregar botón de rol')
                        .setStyle(ButtonStyle.Success)
                );
            } else {
                rows.push(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`autorole_add_${messageId}`)
                            .setLabel('➕ Agregar botón de rol')
                            .setStyle(ButtonStyle.Success)
                    )
                );
            }
        }

        try {
            const channel = await interaction.client.channels.fetch(config.channelId);
            const targetMessage = await channel.messages.fetch(messageId);
            await targetMessage.edit({ components: rows });
        } catch (error) {
            console.error('Error actualizando el mensaje de auto-roles:', error);
        }

        await interaction.reply({
            content: `Botón agregado: ${emoji} → <@&${role.id}>`,
            ephemeral: true
        });
        return true;
    }

    return false;
};
