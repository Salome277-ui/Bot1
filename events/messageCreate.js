const { EmbedBuilder } = require('discord.js');
const { getCustomCommands } = require('../data/storage');
const { isBotAdminMember } = require('../utils/permissions');
const { PASTEL_RED, PASTEL_GREEN } = require('../data/constants');

module.exports = async function messageCreate(client, message) {
    if (message.author.bot) return;
    if (!message.content) return;

    const trigger = message.content.trim().toLowerCase();

    // --- "nurse lock" bloquea el canal actual (solo admins del bot) ---
    if (trigger === 'nurse lock') {
        if (!message.guild) return;

        if (!isBotAdminMember(message.guildId, message.member)) {
            return message.reply({
                content: 'No tienes permiso para usar esto. Pídele a un administrador que te agregue con /add-admin.'
            });
        }

        const channel = message.channel;
        const everyoneRole = message.guild.roles.everyone;

        try {
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false,
                SendMessagesInThreads: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false,
                AttachFiles: false
            });

            let newName = channel.name;
            if (!newName.startsWith('nurse-lock-')) {
                newName = `nurse-lock-${channel.name}`;
                await channel.setName(newName);
            }

            const embed = new EmbedBuilder()
                .setColor(PASTEL_RED)
                .setTitle('🔒 Canal cerrado')
                .setDescription('Nadie podrá escribir, enviar archivos ni crear hilos en este canal.');

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error bloqueando el canal (texto):', error);
            await message.reply({
                content: 'No pude bloquear el canal. Revisa que el bot tenga "Manage Channels" y "Manage Roles".'
            });
        }

        return;
    }

    // --- "nurse unlock" vuelve a abrir el canal actual (solo admins del bot) ---
    if (trigger === 'nurse unlock') {
        if (!message.guild) return;

        if (!isBotAdminMember(message.guildId, message.member)) {
            return message.reply({
                content: 'No tienes permiso para usar esto. Pídele a un administrador que te agregue con /add-admin.'
            });
        }

        const channel = message.channel;
        const everyoneRole = message.guild.roles.everyone;

        try {
            await channel.permissionOverwrites.delete(everyoneRole);

            let newName = channel.name;
            if (newName.startsWith('nurse-lock-')) {
                newName = newName.replace('nurse-lock-', '');
                await channel.setName(newName);
            }

            const embed = new EmbedBuilder()
                .setColor(PASTEL_GREEN)
                .setTitle('🔓 Canal abierto')
                .setDescription('Ya se puede volver a escribir, enviar archivos y crear hilos en este canal.');

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error desbloqueando el canal (texto):', error);
            await message.reply({
                content: 'No pude abrir el canal. Revisa que el bot tenga "Manage Channels" y "Manage Roles".'
            });
        }

        return;
    }

    // --- Comandos personalizados creados con /personalizado ---
    const customCommands = getCustomCommands();
    const command = customCommands[trigger];

    if (!command) return;

    const embed = new EmbedBuilder()
        .setTitle(command.title)
        .setDescription(command.description)
        .setColor('#5865F2');

    await message.reply({ embeds: [embed] });
};
