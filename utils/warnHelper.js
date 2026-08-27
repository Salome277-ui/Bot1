const { EmbedBuilder } = require('discord.js');
const { getWarns, saveWarns } = require('../data/storage');
const { PASTEL_RED } = require('../data/constants');

/**
 * Aplica un warn a un usuario, guarda el conteo, y le manda un DM
 * con un mensaje que va escalando según cuántos warns lleva.
 * Devuelve { count, embed } para que quien llame decida cómo mostrarlo.
 */
async function applyWarn(client, guild, targetUser, reason) {
    const warns = await getWarns();
    const guildId = guild.id;

    if (!warns[guildId]) warns[guildId] = {};
    if (!warns[guildId][targetUser.id]) warns[guildId][targetUser.id] = 0;

    warns[guildId][targetUser.id] += 1;
    await saveWarns(warns);

    const count = warns[guildId][targetUser.id];

    const embed = new EmbedBuilder()
        .setColor(PASTEL_RED)
        .setDescription(`**Razon:** ${reason}\n\nhaz recibido ${count}/3 Warns`);

    let dmMessage;
    if (count === 1) {
        dmMessage = `⚠️ Has recibido una advertencia (warn) en **${guild.name}**\n\n**Razón:** ${reason}\n\nTen cuidado, evita que esto vuelva a pasar.`;
    } else if (count === 2) {
        dmMessage = `🚨 Has recibido tu segunda advertencia (warn) en **${guild.name}**\n\n**Razón:** ${reason}\n\nEsto ya es más grave. Si sigue pasando podrías ser expulsado.`;
    } else {
        dmMessage = `⛔ Has recibido tu tercera advertencia (warn) en **${guild.name}**\n\n**Razón:** ${reason}\n\nProbablemente serás baneado del servidor si esto continúa.`;
    }

    try {
        const dmEmbed = new EmbedBuilder()
            .setColor(PASTEL_RED)
            .setDescription(dmMessage);
        await targetUser.send({ embeds: [dmEmbed] });
    } catch (error) {
        console.log(`No se pudo enviar DM a ${targetUser.tag} (probablemente tiene los DMs cerrados).`);
    }

    return { count, embed };
}

module.exports = { applyWarn };
