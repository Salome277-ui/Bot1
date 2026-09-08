const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getGiveaways, saveGiveaways, getCustomCommands, saveCustomCommands } = require('../../data/storage');
const { GIVEAWAY_EMOJI } = require('../../data/constants');

module.exports = async function modalHandlers2(interaction) {
    const { customId } = interaction;

    if (customId === 'giveaway_modal') {
        const title = interaction.fields.getTextInputValue('giveaway_title');
        const desc = interaction.fields.getTextInputValue('giveaway_desc');
        const image = interaction.fields.getTextInputValue('giveaway_image');

        const embed = new EmbedBuilder().setTitle(title).setDescription(desc).setColor('#F1C40F');
        if (image) embed.setImage(image);

        await interaction.reply({ content: `# GIVEAWAY ${GIVEAWAY_EMOJI}`, embeds: [embed] });

        const sentMessage = await interaction.fetchReply();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`giveaway_participar_${sentMessage.id}`)
                .setLabel('Participar')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({ components: [row] });

        const giveaways = await getGiveaways();
        giveaways[sentMessage.id] = {
            channelId: interaction.channelId,
            title,
            participants: [],
            ended: false,
            createdAt: Date.now()
        };
        await saveGiveaways(giveaways);

        return true;
    }

    if (customId === 'personalizado_modal') {
        const trigger = interaction.fields
            .getTextInputValue('personalizado_trigger')
            .trim()
            .toLowerCase();
        const desc = interaction.fields.getTextInputValue('personalizado_desc');

        const customCommands = await getCustomCommands();
        customCommands[trigger] = { description: desc };
        await saveCustomCommands(customCommands);

        await interaction.reply({
            content: `Comando personalizado creado. Cuando alguien escriba "${trigger}" se enviará el embed configurado.`,
            ephemeral: true
        });
        return true;
    }

    return false;
};
