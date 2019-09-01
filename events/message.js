
const Discord = require('discord.js');

const scanPokerollMessages = require('../commands/scan');
const handleTestMessage = require('../commands/test');

const findCreeEmoji = require('../lib/guild/findCreeEmoji');

const badRoll = require('../lib/message/badRoll');
const wonLegendary = require('../lib/message/wonLegendary');

const isAuthorised = require('../lib/user/isAuthorised');

/**
 * Handles a new message
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
const handleMessage = (client, message) => {
	// Ignore messages from self
	if (client.user.id === message.author.id) return;

	words = message.content.split(/\s+/);
	
	if (message.channel.type == "dm") {
		// ignore DMs for now
	
	} else if (words[0] === "$scan") {
		if (isAuthorised(message.author)) {
			scanPokerollMessages(client, message);
		}

	} else if (words[0] === "$test") {
		handleTestMessage(message);

	} else {
		const response = decideResponse(client, message);
		if (response !== undefined) {
			message.channel.send(response);
		}
	}
};

/**
 * Decides a response to the given message. Returns undefined if the bot
 * should not respond.
 * @param {Discord.Client} client
 * @param {Discord.Message} message 
 * @returns {string}
 */
function decideResponse(client, message) {
	if (badRoll(message)) {
		return `${findCreeEmoji(message.guild)}`;
	} else if (wonLegendary(message)) {
		return `${findCreeEmoji(message.guild)} `.repeat(3);
	} else if (creesAtMe(client, message)) {
		return `${message.author} ${findCreeEmoji(message.guild)}`;
	} else {
		return undefined;
	}
}

/**
 * Returns  true if the message contains the cree emote and mentions the
 * bot, and false otherwise.
 * @param {Discord.Client} client
 * @param {Discord.Message} message 
 * @returns {boolean}
 */
function creesAtMe(client, message) {
	return message.content.search(findCreeEmoji(message.guild)) !== -1 &&
		   message.isMemberMentioned(client.user);
}

module.exports = handleMessage;
