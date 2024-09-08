const { SlashCommandBuilder } = require('discord.js');

const previousPermissions = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Lock down the server to only allow Server Staff to chat.'),
    async execute(interaction) {
        await interaction.deferReply(); // Inform Discord that we're processing

        const serverStaffRole = interaction.guild.roles.cache.find(role => role.name === 'Server Staff');

        if (!serverStaffRole) {
            return interaction.editReply({ content: 'Server Staff role not found!' });
        }

        try {
            // Lock down all channels
            await Promise.all(interaction.guild.channels.cache.map(async channel => {
                if (channel.isTextBased()) {
                    // Save previous permissions
                    const overwrites = channel.permissionOverwrites.cache.map(permission => ({
                        id: permission.id,
                        allow: permission.allow.toArray(),
                        deny: permission.deny.toArray()
                    }));
                    previousPermissions.set(channel.id, overwrites);

                    // Update permissions
                    await channel.permissionOverwrites.edit(serverStaffRole.id, {
                        SendMessages: true,
                        ViewChannel: true,
                    });

                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
                        SendMessages: false,
                        ViewChannel: true,
                    });
                }
            }));

            await interaction.editReply({ content: 'Server is now locked down. Only Server Staff can chat.' });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'There was an error while executing this command!' });
        }
    },
};
