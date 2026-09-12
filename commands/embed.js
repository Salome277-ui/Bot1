const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Crea un embed personalizado')
        .addUserOption(option =>
            option
                .setName('mencionar')
                .setDescription('Persona a la que quieres mencionar junto al embed (opcional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const mentionUser = interaction.options.getUser('mencionar');
        const mentionId = mentionUser ? mentionUser.id : 'none';

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`embed_crear_${mentionId}`)
                .setLabel('Crear embed')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('embed_cancelar')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            content: '¿Seguro que quieres crear un embed?',
            components: [row],
            ephemeral: true
        });
    }
};
