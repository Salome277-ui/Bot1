const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');
const { getTickets, saveTickets, getTicketCounter, saveTicketCounter, getAdmins } = require('../data/storage');
const { PASTEL_PINK } = require('../data/constants');

const NUEVO_TICKET_MESSAGE = [
    '# `🩷` __Nuevo ticket!__',
    '𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟',
    '<@&1523310990861664276>  <@&1524894309508186224>      ',
    '',
    '> Por favor espera a que alguien del staff atienda lo que nesecitas 💭',
    '𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟𓎟'
].join('\n');

const CATEGORY_LABELS = {
    reporte: 'Reporte/queja',
    recompensas: 'Recompensas',
    alianzas: 'Alianzas',
    otro: 'Otro'
};

async function createTicketChannel(interaction, category) {
    const guild = interaction.guild;
    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const counters = await getTicketCounter();
    const nextNumber = (counters[guildId] || 0) + 1;
    counters[guildId] = nextNumber;
    await saveTicketCounter(counters);

    const ticketNumber = String(nextNumber).padStart(3, '0');
    const channelName = `ticket-${ticketNumber}`;

    const admins = await getAdmins();
    const guildAdmins = admins[guildId] || [];

    const overwrites = [
        {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
        },
        {
            id: userId,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
            ]
        }
    ];

    guildAdmins.forEach(adminId => {
        overwrites.push({
            id: adminId,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
            ]
        });
    });

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: overwrites
    });

    const welcomeEmbed = new EmbedBuilder()
        .setColor(PASTEL_PINK)
        .setDescription(NUEVO_TICKET_MESSAGE);

    const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('cerrar ticket')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('ticket_claim')
            .setLabel('Claim ticket')
            .setEmoji('📜')
            .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [welcomeEmbed], components: [closeRow] });

    const tickets = await getTickets();
    tickets[channel.id] = {
        guildId,
        creatorId: userId,
        ticketNumber: nextNumber,
        category,
        claimedBy: null
    };
    await saveTickets(tickets);

    return { channel, ticketNumber };
}

module.exports = { createTicketChannel, CATEGORY_LABELS };
