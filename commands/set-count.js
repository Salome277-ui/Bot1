const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { getCounting, saveCounting } = require('../data/storage');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-count')
        .setDescription('Configura el canal donde se hará el conteo')
        .addChannelOption(option =>
            option
                .setName('canal')
                .setDescription('El canal que será el canal de conteo')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');
        const counting = getCounting();

        counting[interaction.guildId] = {
            channelId: channel.id,
            count: 0
        };
        saveCounting(counting);

        await interaction.reply({
            content: `✅ <#${channel.id}> ahora es el canal de conteo. El conteo empieza en 1.`,
            ephemeral: true
        });
    }
};
