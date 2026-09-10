// ============================================================
//  El TOKEN y CLIENT_ID se leen de variables de entorno.
//  En Railway: pestaña "Variables". En Replit: pestaña "Secrets".
//  Nombres: DISCORD_TOKEN y DISCORD_CLIENT_ID
// ============================================================

require('./keepalive');

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials, REST, Routes, ActivityType } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID || '';

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

// Registrar automáticamente los comandos slash cada vez que el bot arranca
async function registerCommands() {
    try {
        const commands = client.commands.map(command => command.data.toJSON());
        const rest = new REST({ version: '10' }).setToken(TOKEN);

        const route = GUILD_ID
            ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
            : Routes.applicationCommands(CLIENT_ID);

        await rest.put(route, { body: commands });
        console.log(`✅ ${commands.length} comandos registrados automáticamente.`);
    } catch (err
