const { EmbedBuilder } = require('discord.js');
const { getAfk, saveAfk } = require('../data/storage');
const { formatDuration } = require('../utils/afkHelper');
const { PASTEL_PINK } = require('../data/constants');

async function checkAfk(message) {
    const guildId = message.guildId;
    const afk = await getAfk();
    const guildAfk = afk[guildId] || {};

    // Si el autor estaba AFK, se le quita el estado
    if (guildAfk[message.author.id]) {
        const duration = formatDuration(Date.now() - guildAfk[message.author.id].since);
        delete guildAfk[message.author.id];
        afk[guildId] = guildAfk;
        await saveAfk(afk);

        await message.channel.send({
            content: `¡Bienvenido/a de regreso! <@${message.author.id}>, tu estado AFK fue removido.\n>w<\nAusente desde: ${duration}`
        });
    }

    // Si mencionó a alguien que está AFK, se le avisa
    if (message.mentions.users.size > 0) {
        for (const [userId, user] of message.mentions.users) {
            if (guildAfk[userId]) {
                const duration = formatDuration(Date.now() - guildAfk[userId].since);
                const embed = new EmbedBuilder()
                    .setColor(PASTEL_PINK)
                    .setDescription(
                        `**${user.username}** está ausente desde **${duration}**.\nEl motivo es: ${guildAfk[userId].reason}`
                    );
                await message.channel.send({ embeds: [embed] });
            }
        }
    }
}

module.exports = { checkAfk };
