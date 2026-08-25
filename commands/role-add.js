const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    adminOnly: true,
    data: new SlashCommandBuilder()
        .setName('role-add')
        .setDescription('Le da un rol a un miembro')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El miembro que recibirá el rol')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription('El rol que se le va a dar')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getMember('usuario');
        const role = interaction.options.getRole('rol');

        if (!target) {
            return interaction.reply({
                content: 'No pude encontrar a ese miembro en el servidor.',
                ephemeral: true
            });
        }

        try {
            await target.roles.add(role);
        } catch (error) {
            console.error('Error agregando rol:', error);
            return interaction.reply({
                content: 'No pude darle ese rol. Revisa que el rol del bot esté por encima de ese rol en la jerarquía y que tenga el permiso "Manage Roles".',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setDescription(`El rol <@&${role.id}> ah sido añadido a <@${target.id}>!!`);

        await interaction.reply({ embeds: [embed] });
    }
};
