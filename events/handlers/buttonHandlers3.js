const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getTickets, saveTickets } = require('../../data/storage');
const { PASTEL_RED } = require('../../data/constants');
const { isBotAdmin } = require('../../utils/permissions');

module.exports = async function buttonHandlers3(interaction) {
    const { customId } = interaction;

    if (customId.startsWith('ticket_open_')) {
        try {
            await interaction.deferReply({ ephemeral: true });
        } catch (error) {
            console.error('No pude confirmar la interacción a tiempo:', error);
            return true;
        }

        const category = customId.replace('ticket_open_', '');
        const { createTicketChannel } = require('../../utils/ticketHelper');

        let result;
        try {
            result = await createTicketChannel(interaction, category);
        } catch (error) {
            console.error('Error creando ticket:', error);
            await interaction.editReply({ content: 'No pude crear tu ticket. Avísale a un administrador.' });
            return true;
        }

        const goRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Ir al canal')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${interaction.guildId}/${result.channel.id}`)
        );

        await interaction.editReply({ content: 'Tu ticket ha sido creado!!!', components: [goRow] });
        return true;
    }

    if (customId === 'ticket_close') {
        const tickets = await getTickets();
        const ticketData = tickets[interaction.channelId];

        if (!ticketData) {
            await interaction.reply({ content: 'Esto no parece ser un canal de ticket válido.', ephemeral: true });
            return true;
        }

        const isCreator = ticketData.creatorId === interaction.user.id;
        const isAdmin = await isBotAdmin(interaction);

        if (!isCreator && !isAdmin) {
            await interaction.reply({ content: 'No puedes cerrar este ticket.', ephemeral: true });
            return true;
        }

        await interaction.reply({ content: '🔒 Cerrando este ticket en 5 segundos...' });

        try {
            const creator = await interaction.client.users.fetch(ticketData.creatorId);
            const dmEmbed = new EmbedBuilder()
                .setColor(PASTEL_RED)
                .setTitle('Ticket Closed')
                .setDescription(`This ticket has been closed by <@${interaction.user.id}>`)
                .addFields(
                    { name: 'Ticket Name', value: `Ticket ${String(ticketData.ticketNumber).padStart(3, '0')}` },
                    { name: 'Server', value: interaction.guild.name }
                );
            await creator.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log('No se pudo enviar el DM de cierre de ticket.');
        }

        delete tickets[interaction.channelId];
        await saveTickets(tickets);

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);

        return true;
    }

    if (customId === 'ticket_claim') {
        if (!(await isBotAdmin(interaction))) {
            await interaction.reply({ content: 'Solo el staff puede reclamar tickets.', ephemeral: true });
            return true;
        }

        const tickets = await getTickets();
        const ticketData = tickets[interaction.channelId];

        if (!ticketData) {
            await interaction.reply({ content: 'Esto no parece ser un canal de ticket válido.', ephemeral: true });
            return true;
        }

        ticketData.claimedBy = interaction.user.id;
        tickets[interaction.channelId] = ticketData;
        await saveTickets(tickets);

        await interaction.reply({
            content: `<@${ticketData.creatorId}> Un admin ha reclamado el ticket! <@${interaction.user.id}>`
        });
        return true;
    }

    return false;
};
