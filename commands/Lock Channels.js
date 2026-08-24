const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock-channels')
        .setDescription('Bloquea todos los canales'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#FF9E9E')
            .setTitle('PRUEBA')
            .setDescription('Aun trabajando en ello');

        await interaction.reply({ embeds: [embed] });
    }
};
