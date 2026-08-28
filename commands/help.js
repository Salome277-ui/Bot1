const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RANDOM_EMOJIS, COLORS } = require('../data/constants');

function randomEmoji() {
    return RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)];
}

const COMMANDS_INFO = [
    { name: '/embed', desc: 'Crea un embed personalizado (título, texto, imagen, autor y color).' },
    { name: '/anuncio', desc: 'Envía un anuncio con título, descripción e imagen a un canal.' },
    { name: '/giveaway', desc: 'Crea un giveaway con botón de participación.' },
    { name: '/win', desc: 'Elige un ganador al azar de un giveaway activo.' },
    { name: '/personalizado', desc: 'Crea un comando de texto propio que responde con un embed.' },
    { name: '/zape', desc: 'Dale un zape a alguien (con opción de devolverlo).' },
    { name: '/8ball', desc: 'Hazle una pregunta a la bola 8.' },
    { name: '/warn', desc: 'Da un warn a un usuario con una razón.' },
    { name: '/game', desc: 'Juega piedra, papel o tijera contra el bot.' },
    { name: '/add-admin', desc: '(Admin) Da permiso a alguien para usar los comandos de administrador.' },
    { name: '/eat-or-leave', desc: '(Admin) Crea una votación Eat or Leave con reacciones E y L.' },
    { name: '/lock-channel', desc: '(Admin) Bloquea el canal actual para que nadie escriba.' },
    { name: '/unlock-channel', desc: '(Admin) Vuelve a abrir un canal bloqueado.' },
    { name: '/set-count', desc: '(Admin) Configura el canal donde se hará el conteo (1, 2, 3...).' },
    { name: '/role-add', desc: '(Admin) Le da un rol a un miembro.' },
    { name: '/auto-roles', desc: '(Admin) Crea un mensaje de auto-roles con botones (máx. 5).' },
    { name: '/lock-channels', desc: '(Admin) Bloquea TODOS los canales de texto.' },
    { name: '/unlock-channels', desc: '(Admin) Desbloquea TODOS los canales de texto.' },
    { name: '/set-ticket', desc: '(Admin) Envía el panel de tickets a un canal.' },
    { name: '/help', desc: 'Muestra esta lista de comandos.' }
];

function buildHelpEmbed() {
    return new EmbedBuilder()
        .setTitle('📖 Lista de comandos')
        .setColor('#5865F2')
        .setDescription(
            COMMANDS_INFO.map(
                c => `${randomEmoji()} **${c.name}** — ${c.desc}`
            ).join('\n\n')
        )
        .addFields({
            name: '🎨 Colores para copiar y pegar',
            value: COLORS.map(c => `**${c.name}:** \`${c.hex}\``).join('\n')
        })
        .setFooter({ text: 'Usa "/" para ver la lista de comandos en cualquier momento' });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra todos los comandos disponibles'),

    async execute(interaction) {
        const embed = buildHelpEmbed();
        await interaction.reply({ embeds: [embed] });
    },

    buildHelpEmbed
};
