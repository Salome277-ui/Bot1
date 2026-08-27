const { SlashCommandBuilder } = require('discord.js');
const { WARN_EMOJI } = require('../data/constants');
const { applyWarn } = require('../utils/warnHelper');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Da un warn a un usuario')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario que recibirá el warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('razon')
                .setDescription('Razón del warn')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');

        const { embed } = await applyWarn(interaction.client, interaction.guild, target, razon);

        await interaction.reply({
            content: `<@${target.id}> haz recibido un warn ${WARN_EMOJI}`,
            embeds: [embed]
        });
    }
};
