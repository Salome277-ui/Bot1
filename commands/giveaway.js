const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Crea un giveaway'),

    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway_crear')
                .setLabel('Crear giveaway')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('giveaway_cancelar')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            content: '¿Seguro que quieres crear un giveaway?',
            components: [row],
            ephemeral: true
        });
    }
};
