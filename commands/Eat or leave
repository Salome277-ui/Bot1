const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('eat-or-leave')
        .setDescription('Crea una votación de Eat or Leave'),

    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('eatleave_confirmar')
                .setLabel('Sí, crear')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('eatleave_cancelar')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            content: '¿Seguro que quieres crear un Eat or Leave?',
            components: [row],
            ephemeral: true
        });
    }
};
