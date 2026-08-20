// ============================================================
//  El TOKEN y CLIENT_ID se leen de variables de entorno.
//  GUILD_ID es opcional: si lo defines, los comandos aparecen
//  al instante SOLO en ese servidor.
// ============================================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID || '';

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`Registrando ${commands.length} comandos...`);

        const route = GUILD_ID
            ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
            : Routes.applicationCommands(CLIENT_ID);

        await rest.put(route, { body: commands });

        console.log('✅ Comandos registrados correctamente.');
        if (!GUILD_ID) {
            console.log('ℹ️ Son comandos globales, pueden tardar hasta 1 hora en aparecer.');
        }
    } catch (error) {
        console.error('❌ Error registrando comandos:', error);
    }
})();
