const { EmbedBuilder } = require('discord.js');
const { getCustomCommands, getCounting, saveCounting } = require('../data/storage');
const { isBotAdminMember } = require('../utils/permissions');
const { PASTEL_RED, PASTEL_GREEN } = require('../data/constants');

module.exports = async function messageCreate(client, message) {
    if (message.author.bot) return;
    if (!message.content) return;
    if (!message.guild) return;

    const trigger = message.content.trim().toLowerCase();

    // --- "nurse lock" bloquea el canal actual (solo admins del bot) ---
    if (trigger === 'nurse lock') {
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

    // --- Conteo (canal configurado con /set-count) ---
    const counting = getCounting();
    const guildCounting = counting[message.guildId];

    if (guildCounting && guildCounting.channelId === message.channelId) {
        const content = message.content.trim();

        // Si no es un número puro, se ignora (no cuenta como error)
        if (!/^\d+$/.test(content)) return;

        const number = parseInt(content, 10);
        const expected = guildCounting.count + 1;

        // El conteo está en 0 (recién reiniciado) y empiezan con un número que no es el 1
        if (guildCounting.count === 0 && number !== 1) {
            await message.react('⚠️');
            return;
        }

        if (number === expected) {
            // Número correcto
            if (number === 100) {
                await message.react('💯');
            } else if (number === 67) {
                await message.react('6️⃣');
                await message.react('7️⃣');
            } else {
                await message.react('✅');
            }

            guildCounting.count = number;
            counting[message.guildId] = guildCounting;
            saveCounting(counting);
        } else {
            // Número incorrecto, se arruinó el conteo
            await message.react('❌');

            const embed = new EmbedBuilder()
                .setColor(PASTEL_RED)
                .setDescription(`<@${message.author.id}> ha arruinado el conteo :(`);

            await message.channel.send({ embeds: [embed] });

            guildCounting.count = 0;
            counting[message.guildId] = guildCounting;
            saveCounting(counting);
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
