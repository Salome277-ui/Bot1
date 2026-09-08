const fs = require('fs');
const path = require('path');

// Si existe la variable DATA_DIR (Railway Volume), los archivos se
// guardan ahí para que sobrevivan entre despliegues. Si no existe
// (por ejemplo en local o en Replit), se usan los archivos normales
// dentro de esta misma carpeta.
const BASE_DIR = process.env.DATA_DIR || __dirname;

if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
}

const GIVEAWAYS_FILE = path.join(BASE_DIR, 'giveaways.json');
const CUSTOM_FILE = path.join(BASE_DIR, 'customcommands.json');
const WARNS_FILE = path.join(BASE_DIR, 'warns.json');
const ADMINS_FILE = path.join(BASE_DIR, 'admins.json');
const COUNTING_FILE = path.join(BASE_DIR, 'counting.json');
const AUTOROLES_FILE = path.join(BASE_DIR, 'autoroles.json');
const TICKETS_FILE = path.join(BASE_DIR, 'tickets.json');
const TICKET_COUNTER_FILE = path.join(BASE_DIR, 'ticketcounter.json');

function loadJSON(file) {
    if (!fs.existsSync(file)) return {};
    try {
        const raw = fs.readFileSync(file, 'utf8');
        return raw ? JSON.parse(raw) : {};
    } catch (err) {
        console.error(`Error leyendo ${file}:`, err);
        return {};
    }
}

function saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
    getGiveaways: () => loadJSON(GIVEAWAYS_FILE),
    saveGiveaways: (data) => saveJSON(GIVEAWAYS_FILE, data),
    getCustomCommands: () => loadJSON(CUSTOM_FILE),
    saveCustomCommands: (data) => saveJSON(CUSTOM_FILE, data),
    getWarns: () => loadJSON(WARNS_FILE),
    saveWarns: (data) => saveJSON(WARNS_FILE, data),
    getAdmins: () => loadJSON(ADMINS_FILE),
    saveAdmins: (data) => saveJSON(ADMINS_FILE, data),
    getCounting: () => loadJSON(COUNTING_FILE),
    saveCounting: (data) => saveJSON(COUNTING_FILE, data),
    getAutoRoles: () => loadJSON(AUTOROLES_FILE),
    saveAutoRoles: (data) => saveJSON(AUTOROLES_FILE, data),
    getTickets: () => loadJSON(TICKETS_FILE),
    saveTickets: (data) => saveJSON(TICKETS_FILE, data),
    getTicketCounter: () => loadJSON(TICKET_COUNTER_FILE),
    saveTicketCounter: (data) => saveJSON(TICKET_COUNTER_FILE, data)
};
