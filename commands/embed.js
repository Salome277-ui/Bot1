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
        .setDescription('Crea un embed personalizado'),

    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('embed_crear')
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
