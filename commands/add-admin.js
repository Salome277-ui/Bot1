const { SlashCommandBuilder } = require('discord.js');
const { getAdmins, saveAdmins } = require('../data/storage');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('add-admin')
        .setDescription('Agrega a alguien como administrador del bot')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('La persona que podrá usar los comandos de administrador')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const guildId = interaction.guildId;

        const admins = getAdmins();
        if (!admins[guildId]) admins[guildId] = [];

        if (admins[guildId].includes(target.id)) {
            return interaction.reply({
                content: `<@${target.id}> ya es administrador del bot.`,
                ephemeral: true
            });
        }

        admins[guildId].push(target.id);
        saveAdmins(admins);

        return interaction.reply({
            content: `<@${target.id}> ahora puede usar los comandos de administrador del bot.`,
            ephemeral: true
        });
    }
};
