const { Events, InteractionType, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType } = require('discord.js');
require('dotenv').config();
const categoryId = process.env.CATEGORY_ID;

module.exports = {
    name: Events.InteractionCreate,
    execute(interaction) {
        if (interaction.type === InteractionType.ApplicationCommand) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (command) {
                try {
                    command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.type === InteractionType.MessageComponent) {
            if (interaction.customId === 'create_ticket') {
                const user = interaction.user;
                const staffRole = interaction.guild.roles.cache.find(role => role.name === 'Server Staff');

                if (!staffRole) {
                    return interaction.reply({ content: 'Staff role not found!', ephemeral: true });
                }

                interaction.guild.channels.create({
                    name: `ticket-${user.username}`,
                    type: ChannelType.GuildText,
                    topic: `Ticket for ${user.username}`,
                    parent: categoryId,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: staffRole.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ],
                }).then(ticketChannel => {
                    const lockButton = new ButtonBuilder()
                        .setCustomId('lock_ticket')
                        .setLabel('Lock Ticket')
                        .setStyle(ButtonStyle.Secondary);

                    const closeButton = new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder().addComponents(lockButton, closeButton);

                    ticketChannel.send({
                        content: `Hello ${user}, please describe your issue in detail. The staff will be with you shortly.`,
                        components: [row],
                    });

                    interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });
                }).catch(error => {
                    console.error(error);
                    interaction.reply({ content: 'There was an error creating the ticket channel!', ephemeral: true });
                });
            } else if (interaction.customId === 'lock_ticket') {
                // Lock ticket logic
                const channel = interaction.channel;
                const staffRole = interaction.guild.roles.cache.find(role => role.name === 'Server Staff');
                if (!staffRole) {
                    return interaction.reply({ content: 'Staff role not found!', ephemeral: true });
                }

                channel.permissionOverwrites.edit(staffRole.id, {
                    SendMessages: false,
                    AddReactions: false,
                }).then(() => {
                    interaction.reply({ content: 'The ticket has been locked.', ephemeral: true });
                }).catch(error => {
                    console.error(error);
                    interaction.reply({ content: 'There was an error locking the ticket.', ephemeral: true });
                });
            } else if (interaction.customId === 'close_ticket') {
                // Close ticket logic
                const channel = interaction.channel;
                channel.delete().catch(error => {
                    console.error(error);
                    interaction.reply({ content: 'There was an error closing the ticket.', ephemeral: true });
                });
            }
        }
    },
};
