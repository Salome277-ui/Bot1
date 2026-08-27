const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const { getCustomCommands, getCounting, saveCounting } = require('../data/storage');
const { isBotAdminMember } = require('../utils/permissions');
const { applyWarn } = require('../utils/warnHelper');
const { PASTEL_RED, PASTEL_GREEN, WARN_EMOJI } = require('../data/constants');

module.exports = async function messageCreate(client, message) {
    if (message.author.bot) return;
    if (!message.content) return;
    if (!message.guild) return;

    const rawContent = message.content.trim();
    const trigger = rawContent.toLowerCase();

    // --- "nurse lock" bloquea el canal actual (solo admins del bot) ---
    if (trigger === 'nurse lock') {
        if (!(await isBotAdminMember(message.guildId, message.member))) {
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
        if (!(await isBotAdminMember(message.guildId, message.member))) {
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

    // --- "nurse game" abre el juego de piedra, papel o tijera ---
    if (trigger === 'nurse game') {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎮 Piedra, Papel o Tijera')
            .setDescription('Elige una opción para jugar contra mí:');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`game_piedra_${message.author.id}`)
                .setLabel('🪨 Piedra')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`game_papel_${message.author.id}`)
                .setLabel('📄 Papel')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`game_tijera_${message.author.id}`)
                .setLabel('✂️ Tijera')
                .setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        return;
    }

    // --- "nurse help" muestra la lista de comandos ---
    if (trigger === 'nurse help') {
        const { buildHelpEmbed } = require('../commands/help');
        const embed = buildHelpEmbed();
        await message.channel.send({ embeds: [embed] });
        return;
    }

    // --- "nurse warn @usuario razón" da un warn (solo admins del bot) ---
    if (/^nurse warn\b/i.test(rawContent)) {
        if (!(await isBotAdminMember(message.guildId, message.member))) {
            return message.reply({
                content: 'No tienes permiso para usar esto. Pídele a un administrador que te agregue con /add-admin.'
            });
        }

        const targetMember = message.mentions.members?.first();
        if (!targetMember) {
            return message.reply({
                content: 'Debes etiquetar al miembro que quieres advertir. Ejemplo: `nurse warn @Usuario spamea mucho`'
            });
        }

        let reason = rawContent
            .replace(/^nurse warn/i, '')
            .replace(/<@!?\d+>/, '')
            .trim();
        if (!reason) reason = 'Sin razón especificada';

        const { embed } = await applyWarn(client, message.guild, targetMember.user, reason);

        await message.channel.send({
            content: `<@${targetMember.id}> haz recibido un warn ${WARN_EMOJI}`,
            embeds: [embed]
        });

        return;
    }

    // --- Conteo (canal configurado con /set-count) ---
    const counting = await getCounting();
    const guildCounting = counting[message.guildId];

    if (guildCounting && guildCounting.channelId === message.channelId) {
        const content = message.content.trim();

        if (!/^\d+$/.test(content)) return;

        const number = parseInt(content, 10);
        const expected = guildCounting.count + 1;

        if (guildCounting.count === 0 && number !== 1) {
            await message.react('⚠️');
            return;
        }

        if (guildCounting.lastUserId === message.author.id) {
            await message.react('❌');

            const embed = new EmbedBuilder()
                .setColor(PASTEL_RED)
                .setDescription(`<@${message.author.id}> ha arruinado el conteo por contar dos veces seguidas :(`);

            await message.channel.send({ embeds: [embed] });

            guildCounting.count = 0;
            guildCounting.lastUserId = null;
            counting[message.guildId] = guildCounting;
            await saveCounting(counting);
            return;
        }

        if (number === expected) {
            if (number === 100) {
                await message.react('💯');
            } else if (number === 67) {
                await message.react('6️⃣');
                await message.react('7️⃣');
            } else {
                await message.react('✅');
            }

            guildCounting.count = number;
            guildCounting.lastUserId = message.author.id;
            counting[message.guildId] = guildCounting;
            await saveCounting(counting);
        } else {
            await message.react('❌');

            const embed = new EmbedBuilder()
                .setColor(PASTEL_RED)
                .setDescription(`<@${message.author.id}> ha arruinado el conteo :(`);

            await message.channel.send({ embeds: [embed] });

            guildCounting.count = 0;
            guildCounting.lastUserId = null;
            counting[message.guildId] = guildCounting;
            await saveCounting(counting);
        }

        return;
    }

    // --- Comandos personalizados creados con /personalizado ---
    const customCommands = await getCustomCommands();
    const command = customCommands[trigger];

    if (!command) return;

    const embed = new EmbedBuilder()
        .setDescription(command.description)
        .setColor('#5865F2');

    await message.reply({ embeds: [embed] });
};
