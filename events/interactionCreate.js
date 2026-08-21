cat > /home/claude/discord-bot/events/interactionCreate.js << 'ENDOFFILE'
const { EmbedBuilder } = require('discord.js');
const {
    buildEmbedModal,
    buildGiveawayModal,
    buildEatOrLeaveModal
} = require('../interfaces/modals');
const { getGiveaways, saveGiveaways } = require('../data/storage');
const {
    ANUNCIO_EMOJI,
    GIVEAWAY_EMOJI,
    PASTEL_RED,
    ZAPE_GIF,
    ZAPE_EMOJI,
    GAME_CHOICES,
    GAME_EMOJIS

function isValidHexColor(value) {
    return /^#?[0-9A-Fa-f]{6}$/.test(value);
}

function normalizeHex(value) {
    return value.startsWith('#') ? value : `#${value}`;
}

module.exports = async function interactionCreate(client, interaction) {
    try {
        // ----- SLASH COMMANDS -----
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

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
                const giveaways = getGiveaways();
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
                    saveGiveaways(giveaways);
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

                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`giveaway_participar_${sentMessage.id}`)
                        .setLabel('Participar')
                        .setStyle(ButtonStyle.Primary)
                );

                await interaction.editReply({ components: [row] });

                const giveaways = getGiveaways();
                giveaways[sentMessage.id] = {
                    channelId: interaction.channelId,
                    title,
                    participants: [],
                    ended: false,
                    createdAt: Date.now()
                };
                saveGiveaways(giveaways);

                return;
            }

            // --- Personalizado ---
            if (customId === 'personalizado_modal') {
                const trigger = interaction.fields
                    .getTextInputValue('personalizado_trigger')
                    .trim()
                    .toLowerCase();
                const title = interaction.fields.getTextInputValue('personalizado_title');
                const desc = interaction.fields.getTextInputValue('personalizado_desc');

                const { getCustomCommands, saveCustomCommands } = require('../data/storage');
                const customCommands = getCustomCommands();
                customCommands[trigger] = { title, description: desc };
                saveCustomCommands(customCommands);

                return interaction.reply({
                    content: `Comando personalizado creado. Cuando alguien escriba "${trigger}" se enviará el embed configurado.`,
                    ephemeral: true
                });
            }

            // --- Eat or Leave ---
            if (customId === 'eatleave_modal') {
                const desc = interaction.fields.getTextInputValue('eatleave_desc');

                const embed = new EmbedBuilder()
                    .setTitle('🍽️ Eat or Leave')
                    .setDescription(desc)
                    .setColor(PASTEL_RED);

                await interaction.reply({ embeds: [embed] });

                const sentMessage = await interaction.fetchReply();
                await sentMessage.react('🇪');
                await sentMessage.react('🇱');

                return;
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
ENDOFFILE
echo OK
