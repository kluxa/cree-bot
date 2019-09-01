
const Discord = require('discord.js');

/**
 * Handles a test message
 * @param {Discord.Message} message 
 */
const handleTestMessage = message => {
	const time = Discord.SnowflakeUtil.deconstruct(message.id).date;
	
	console.log(`Message received at ${time.toString()}: ${message.content}`);
};

module.exports = handleTestMessage;
