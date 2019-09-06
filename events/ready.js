
const Discord = require('discord.js');

const catchup = require('../commands/catchup');

/**
 * The function that fires once the bot has connected to Discord.
 * @param {Discord.Client} client 
 */
const ready = (client) => {
	console.log(`Ready! (Username: ${client.user.username}, ` +
				`ID: ${client.user.id})`);	
	catchup(client);
}

module.exports = ready;
