const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('Juega piedra, papel o tijera contra el bot'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎮 Piedra, Papel o Tijera')
            .setDescription('Elige una opción para jugar contra mí:');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`game_piedra_${interaction.user.id}`)
                .setLabel('🪨 Piedra')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`game_papel_${interaction.user.id}`)
                .setLabel('📄 Papel')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`game_tijera_${interaction.user.id}`)
                .setLabel('✂️ Tijera')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
