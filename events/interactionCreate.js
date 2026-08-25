const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const {
    buildEmbedModal,
    buildGiveawayModal,
    buildEatOrLeaveModal,
    buildAutoRoleAddModal
} = require('../interfaces/modals');
const {
    getGiveaways,
    saveGiveaways,
    getAutoRoles,
    saveAutoRoles
} = require('../data/storage');
const {
    ANUNCIO_EMOJI,
    GIVEAWAY_EMOJI,
    PASTEL_RED,
    ZAPE_GIF,
    ZAPE_EMOJI,
    GAME_CHOICES,
    GAME_EMOJIS
} = require('../data/constants');
const { isBotAdmin } = require('../utils/permissions');

function isValidHexColor(value) {
    return /^#?[0-9A-Fa-f]{6}$/.test(value);
}

function normalizeHex(value) {
    return value.startsWith('#') ? value : `#${value}`;
}

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

module.exports = async function interactionCreate(client, interaction) {
    try {
        // ----- SLASH COMMANDS -----
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.adminOnly && !(await isBotAdmin(interaction))) {
                return interaction.reply({
                    content: 'No tienes permiso para usar este comando. Pídele a un administrador que te agregue con /add-admin.',
                    ephemeral: true
                });
            }

            return command.execute(interaction, client);
        }

        // ----- BOTONES -----
        if (interaction.isButton()) {
            const { customId } = interaction;

            // --- Embed: confirmación ---
            if (customId === 'embed_crear') {
                return interaction.showModal(buildEmbedModal());
            }
            if (customId === 'embed_cancelar') {
                return interaction.update({
                    content: 'Creación de embed cancelada.',
                    components: []
                });
            }

            // --- Giveaway: confirmación ---
            if (customId === 'giveaway_crear') {
                return interaction.showModal(buildGiveawayModal());
            }
            if (customId === 'giveaway_cancelar') {
                return interaction.update({
                    content: 'Creación de giveaway cancelada.',
                    components: []
                });
            }

            // --- Giveaway: participar ---
            if (customId.startsWith('giveaway_participar_')) {
                const messageId = customId.replace('giveaway_participar_', '');
                const giveaways = await getGiveaways();
                const giveaway = giveaways[messageId];

                if (!giveaway) {
                    return interaction.reply({
                        content: 'Este giveaway ya no está disponible.',
                        ephemeral: true
                    });
                }

                if (giveaway.ended) {
                    return interaction.reply({
                        content: 'Este giveaway ya terminó.',
                        ephemeral: true
                    });
                }

                if (!giveaway.participants.includes(interaction.user.id)) {
                    giveaway.participants.push(interaction.user.id);
                    giveaways[messageId] = giveaway;
                    await saveGiveaways(giveaways);
                }

                return interaction.reply({
                    content: `Felicidades haz participado!! Eres uno de los ${giveaway.participants.length} que han participado`,
                    ephemeral: true
                });
            }

            // --- Zape: devolver ---
            if (customId.startsWith('zape_devolver_')) {
                const [, , invokerId, targetId] = customId.split('_');

                if (interaction.user.id !== targetId) {
                    return interaction.reply({
                        content: 'No puedes realizar esta acción.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor(PASTEL_RED)
                    .setImage(ZAPE_GIF);

                return interaction.reply({
                    content: `<@${targetId}> Le ha dado un zape a <@${invokerId}> ${ZAPE_EMOJI}`,
                    embeds: [embed]
                });
            }

            // --- Game: piedra, papel o tijera ---
            if (customId.startsWith('game_')) {
                const parts = customId.split('_');
                const userChoice = parts[1];
                const ownerId = parts[2];

                if (interaction.user.id !== ownerId) {
                    return interaction.reply({
                        content: 'No puedes jugar esta partida, usa /game para crear la tuya.',
                        ephemeral: true
                    });
                }

                const botChoice = GAME_CHOICES[Math.floor(Math.random() * GAME_CHOICES.length)];

                let resultText;
                if (userChoice === botChoice) {
                    resultText = '¡Empate! Elegimos lo mismo.';
                } else if (
                    (userChoice === 'piedra' && botChoice === 'tijera') ||
                    (userChoice === 'tijera' && botChoice === 'papel') ||
                    (userChoice === 'papel' && botChoice === 'piedra')
                ) {
                    resultText = '¡Oh ganaste!...';
                } else {
                    resultText = '¡Oh gané!!!';
                }

                const resultEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('🎮 Resultado')
                    .setDescription(
                        `Tú elegiste: ${GAME_EMOJIS[userChoice]} **${userChoice}**\nYo elegí: ${GAME_EMOJIS[botChoice]} **${botChoice}**\n\n${resultText}`
                    );

                return interaction.update({ embeds: [resultEmbed], components: [] });
            }

            // --- Eat or Leave: confirmación ---
            if (customId === 'eatleave_confirmar') {
                return interaction.showModal(buildEatOrLeaveModal());
            }
            if (customId === 'eatleave_cancelar') {
                return interaction.update({
                    content: 'Creación de Eat or Leave cancelada.',
                    components: []
                });
            }

            // --- Auto-roles: agregar botón nuevo ---
            if (customId.startsWith('autorole_add_')) {
                const messageId = customId.replace('autorole_add_', '');

                if (!(await isBotAdmin(interaction))) {
                    return interaction.reply({
                        content: 'Solo un administrador puede agregar botones aquí.',
                        ephemeral: true
                    });
                }

                return interaction.showModal(buildAutoRoleAddModal(messageId));
            }

            // --- Auto-roles: alguien pide/quita un rol ---
            if (customId.startsWith('autorole_click_')) {
                const roleId = customId.replace('autorole_click_', '');
                const member = interaction.member;

                try {
                    if (member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId);
                        return interaction.reply({
                            content: `Te quité el rol <@&${roleId}>.`,
                            ephemeral: true
                        });
                    } else {
                        await member.roles.add(roleId);
                        return interaction.reply({
                            content: `Te di el rol <@&${roleId}>.`,
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    console.error('Error dando/quitando auto-rol:', error);
                    return interaction.reply({
                        content: 'No pude darte ese rol. Puede que ya no exista o que el bot no tenga permisos suficientes.',
                        ephemeral: true
                    });
                }
            }

            return;
        }
        // ----- MODALES -----
        if (interaction.isModalSubmit()) {
            const { customId } = interaction;

            // --- Embed ---
            if (customId === 'embed_modal') {
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
                    if (isValidHexColor(color)) {
                        embed.setColor(color);
                    } else {
                        embed.setColor('#5865F2');
                    }
                } else {
                    embed.setColor('#5865F2');
                }

                return interaction.reply({ embeds: [embed] });
            }

            // --- Anuncio ---
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
                    return interaction.reply({
                        content: 'No pude encontrar ese canal. Revisa el ID e inténtalo de nuevo.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(desc)
                    .setColor('#FF0000');

                if (image) embed.setImage(image);

                await targetChannel.send({
                    content: `📢 ANUNCIO IMPORTANTE!!!! ${ANUNCIO_EMOJI}`,
                    embeds: [embed]
                });

                return interaction.reply({
                    content: `Anuncio enviado correctamente en <#${channelId}>.`,
                    ephemeral: true
                });
            }

            // --- Giveaway ---
            if (customId === 'giveaway_modal') {
                const title = interaction.fields.getTextInputValue('giveaway_title');
                const desc = interaction.fields.getTextInputValue('giveaway_desc');
                const image = interaction.fields.getTextInputValue('giveaway_image');

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(desc)
                    .setColor('#F1C40F');

                if (image) embed.setImage(image);

                await interaction.reply({
                    content: `# GIVEAWAY ${GIVEAWAY_EMOJI}`,
                    embeds: [embed]
                });

                const sentMessage = await interaction.fetchReply();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`giveaway_participar_${sentMessage.id}`)
                        .setLabel('Participar')
                        .setStyle(ButtonStyle.Primary)
                );

                await interaction.editReply({ components: [row] });

                const giveaways = await getGiveaways();
                giveaways[sentMessage.id] = {
                    channelId: interaction.channelId,
                    title,
                    participants: [],
                    ended: false,
                    createdAt: Date.now()
                };
                await saveGiveaways(giveaways);

                return;
            }

            // --- Personalizado ---
            if (customId === 'personalizado_modal') {
                const trigger = interaction.fields
                    .getTextInputValue('personalizado_trigger')
                    .trim()
                    .toLowerCase();
                const desc = interaction.fields.getTextInputValue('personalizado_desc');

                const { getCustomCommands, saveCustomCommands } = require('../data/storage');
                const customCommands = await getCustomCommands();
                customCommands[trigger] = { description: desc };
                await saveCustomCommands(customCommands);

                return interaction.reply({
                    content: `Comando personalizado creado. Cuando alguien escriba "${trigger}" se enviará el embed configurado.`,
                    ephemeral: true
                });
            }

            // --- Eat or Leave ---
            if (customId === 'eatleave_modal') {
                const desc = interaction.fields.getTextInputValue('eatleave_desc');
                const image = interaction.fields.getTextInputValue('eatleave_image');

                const embed = new EmbedBuilder()
                    .setTitle('🍽️ Eat or Leave')
                    .setDescription(desc)
                    .setColor(PASTEL_RED);

                if (image) embed.setImage(image);

                await interaction.reply({ embeds: [embed] });

                const sentMessage = await interaction.fetchReply();
                await sentMessage.react('🇪');
                await sentMessage.react('🇱');

                return;
                    }
            // --- Auto-roles: crear el mensaje base ---
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

                return;
            }

            // --- Auto-roles: agregar un botón de rol ---
            if (customId.startsWith('autorole_add_modal_')) {
                const messageId = customId.replace('autorole_add_modal_', '');
                const emoji = interaction.fields.getTextInputValue('autorole_emoji').trim();
                const roleText = interaction.fields.getTextInputValue('autorole_role').trim();

                const roleId = extractRoleId(roleText);
                if (!roleId) {
                    return interaction.reply({
                        content: 'No entendí el rol. Menciona el rol (@rol) o pega su ID.',
                        ephemeral: true
                    });
                }

                const role = interaction.guild.roles.cache.get(roleId);
                if (!role) {
                    return interaction.reply({
                        content: 'No encontré ese rol en el servidor.',
                        ephemeral: true
                    });
                }

                const autoRoles = await getAutoRoles();
                const config = autoRoles[messageId];

                if (!config) {
                    return interaction.reply({
                        content: 'Este mensaje de auto-roles ya no está disponible.',
                        ephemeral: true
                    });
                }

                if (config.roles.length >= 5) {
                    return interaction.reply({
                        content: 'Ya se alcanzó el máximo de 5 botones.',
                        ephemeral: true
                    });
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

                return interaction.reply({
                    content: `Botón agregado: ${emoji} → <@&${role.id}>`,
                    ephemeral: true
                });
            }
        }
    } catch (error) {
        console.error('Error manejando la interacción:', error);
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction
                .reply({ content: 'Ocurrió un error al procesar esto.', ephemeral: true })
                .catch(() => {});
        }
    }
};
