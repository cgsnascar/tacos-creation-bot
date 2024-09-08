const { SlashCommandBuilder } = require('discord.js');
const previousPermissions = new Map(); // Map to store previous permissions

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdownoff')
        .setDescription('Unlock the server and return all channels to their previous state.'),
    async execute(interaction) {
        await interaction.deferReply(); // Inform Discord that we're processing

        try {
            // Restore previous permissions
            await Promise.all(interaction.guild.channels.cache.map(async channel => {
                if (channel.isTextBased()) {
                    const permissions = previousPermissions.get(channel.id);
                    if (permissions) {
                        await Promise.all(permissions.map(async permission => {
                            await channel.permissionOverwrites.edit(permission.id, {
                                Allow: permission.allow,
                                Deny: permission.deny,
                            });
                        }));
                        previousPermissions.delete(channel.id); // Clear stored permissions
                    }
                }
            }));

            await interaction.editReply({ content: 'Server lockdown has been lifted and channels have been restored.' });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'There was an error while executing this command!' });
        }
    },
};
