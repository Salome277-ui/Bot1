const fs = require('fs');
const path = require('path');

const GIVEAWAYS_FILE = path.join(__dirname, 'giveaways.json');
const CUSTOM_FILE = path.join(__dirname, 'customcommands.json');
const WARNS_FILE = path.join(__dirname, 'warns.json');

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
    saveWarns: (data) => saveJSON(WARNS_FILE, data)
};
