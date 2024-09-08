const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error('Error executing command:', error);
                if (interaction.deferred || interaction.replied) {
                    try {
                        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                    } catch (err) {
                        console.error('Error sending follow-up message:', err);
                    }
                } else {
                    try {
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    } catch (err) {
                        console.error('Error replying to interaction:', err);
                    }
                }
            }
        } else if (interaction.isButton()) {
            // Handle button interactions here
            try {
                // Example button handling logic
                if (interaction.customId === 'lockdown_button') {
                    // Handle lockdown button logic
                }
                // Acknowledge the interaction
                await interaction.reply({ content: 'Button interaction received.', ephemeral: true });
            } catch (error) {
                console.error('Error handling button interaction:', error);
            }
        }
    },
};
