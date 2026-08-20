const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { EIGHTBALL_ANSWERS, ANUNCIO_EMOJI } = require('../data/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Hazle una pregunta a la bola 8')
        .addStringOption(option =>
            option
                .setName('pregunta')
                .setDescription('Tu pregunta para la bola 8')
                .setRequired(true)
        ),

    async execute(interaction) {
        const pregunta = interaction.options.getString('pregunta');
        const respuesta =
            EIGHTBALL_ANSWERS[Math.floor(Math.random() * EIGHTBALL_ANSWERS.length)];

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription(
                `🎱 **Pregunta:** ${pregunta}\n\n**Respuesta:** ${respuesta} ${ANUNCIO_EMOJI}`
            );

        await interaction.reply({ embeds: [embed] });
    }
};
