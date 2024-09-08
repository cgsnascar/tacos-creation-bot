const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Send a ticket creation button to the specified channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where the ticket button will be posted.')
                .setRequired(true)),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Please select a text channel.', ephemeral: true });
        }

        const button = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Create Ticket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await channel.send({
            content: 'Click the button below to create a ticket.',
            components: [row],
        });

        await interaction.reply({ content: `Ticket button posted in ${channel}.`, ephemeral: true });
    },
};
