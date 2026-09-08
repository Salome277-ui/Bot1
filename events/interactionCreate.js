const { isBotAdmin } = require('../utils/permissions');

const buttonHandlers = [
    require('./handlers/buttonHandlers1'),
    require('./handlers/buttonHandlers2'),
    require('./handlers/buttonHandlers3')
];

const modalHandlers = [
    require('./handlers/modalHandlers1'),
    require('./handlers/modalHandlers2'),
    require('./handlers/modalHandlers3')
];

module.exports = async function interactionCreate(client, interaction) {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.adminOnly && !(await isBotAdmin(interaction))) {
                return interaction.reply({
                    content: 'No tienes permiso para usar este comando. Pídele a un administrador que te agregue con /add-admin.',
                    ephemeral: true
                });
            }

            return command.execute(interaction, client);
        }

        if (interaction.isButton()) {
            for (const handler of buttonHandlers) {
                const handled = await handler(interaction, client);
                if (handled) return;
            }
            return;
        }

        if (interaction.isModalSubmit()) {
            for (const handler of modalHandlers) {
                const handled = await handler(interaction, client);
                if (handled) return;
            }
        }
    } catch (error) {
        console.error('Error manejando la interacción:', error);
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction
                .reply({ content: 'Ocurrió un error al procesar esto.', ephemeral: true })
                .catch(() => {});
        }
    }
};
