// ============================================================
//  El TOKEN y CLIENT_ID se leen de variables de entorno.
//  En Replit: pestaña "Secrets". En Railway: pestaña "Variables".
//  Nombres: DISCORD_TOKEN y DISCORD_CLIENT_ID
// ============================================================

require('./keepalive');

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Cargar comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

// Cargar eventos
const interactionCreate = require('./events/interactionCreate');
const messageCreate = require('./events/messageCreate');
const messageReactionAdd = require('./events/messageReactionAdd');

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'Siendo el bot mas pro del mundo', type: 0 }],
        status: 'online'
    });
});

client.on('interactionCreate', interaction => interactionCreate(client, interaction));
client.on('messageCreate', message => messageCreate(client, message));
client.on('messageReactionAdd', (reaction, user) => messageReactionAdd(client, reaction, user));

if (!TOKEN || !CLIENT_ID) {
    console.error(
        '❌ Falta configurar DISCORD_TOKEN y DISCORD_CLIENT_ID como variables de entorno.'
    );
    process.exit(1);
}

client.login(TOKEN);
