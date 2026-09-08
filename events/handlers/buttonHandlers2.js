const { EmbedBuilder } = require('discord.js');
const { buildEatOrLeaveModal, buildAutoRoleAddModal } = require('../../interfaces/modals');
const { GAME_CHOICES, GAME_EMOJIS } = require('../../data/constants');
const { isBotAdmin } = require('../../utils/permissions');

module.exports = async function buttonHandlers2(interaction) {
    const { customId } = interaction;

    if (customId.startsWith('game_')) {
        const parts = customId.split('_');
        const userChoice = parts[1];
        const ownerId = parts[2];

        if (interaction.user.id !== ownerId) {
            await interaction.reply({
                content: 'No puedes jugar esta partida, usa /game para crear la tuya.',
                ephemeral: true
            });
            return true;
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

        await interaction.update({ embeds: [resultEmbed], components: [] });
        return true;
    }

    if (customId === 'eatleave_confirmar') {
        await interaction.showModal(buildEatOrLeaveModal());
        return true;
    }
    if (customId === 'eatleave_cancelar') {
        await interaction.update({ content: 'Creación de Eat or Leave cancelada.', components: [] });
        return true;
    }

    if (customId.startsWith('autorole_add_')) {
        const messageId = customId.replace('autorole_add_', '');
        if (!(await isBotAdmin(interaction))) {
            await interaction.reply({
                content: 'Solo un administrador puede agregar botones aquí.',
                ephemeral: true
            });
            return true;
        }
        await interaction.showModal(buildAutoRoleAddModal(messageId));
        return true;
    }

    if (customId.startsWith('autorole_click_')) {
        const roleId = customId.replace('autorole_click_', '');
        const member = interaction.member;

        try {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
                await interaction.reply({ content: `Te quité el rol <@&${roleId}>.`, ephemeral: true });
            } else {
                await member.roles.add(roleId);
                await interaction.reply({ content: `Te di el rol <@&${roleId}>.`, ephemeral: true });
            }
        } catch (error) {
            console.error('Error dando/quitando auto-rol:', error);
            await interaction.reply({
                content: 'No pude darte ese rol. Puede que ya no exista o que el bot no tenga permisos suficientes.',
                ephemeral: true
            });
        }
        return true;
    }

    return false;
};
