const { PermissionFlagsBits } = require('discord.js');
const { getAdmins } = require('../data/storage');

/**
 * Un usuario es "admin del bot" si:
 * - Tiene el permiso real de Administrador en el servidor, o
 * - Fue agregado con /add-admin
 */
function isBotAdmin(interaction) {
    if (!interaction.guild || !interaction.member) return false;

    if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return true;
    }

    const admins = getAdmins();
    const guildAdmins = admins[interaction.guildId] || [];
    return guildAdmins.includes(interaction.user.id);
}

module.exports = { isBotAdmin }
