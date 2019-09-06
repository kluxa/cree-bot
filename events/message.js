
const Discord = require('discord.js');

const db = require('../database/database');

const handleCommand = require('../commands/handleCommand');

const findCreeEmoji = require('../lib/guild/findCreeEmoji');

const badRoll = require('../lib/message/badRoll');
const isPokerollMessage = require('../lib/message/isPokerollMessage');
const parsePokeroll = require('../lib/message/parsePokeroll');
const wonLegendary = require('../lib/message/wonLegendary');

/**
 * Handles a new message
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
const handleMessage = (client, message) => {
	// Ignore messages from self
	if (client.user.id === message.author.id) return;

	if (message.channel.type == "dm") {
		// ignore DMs for now
	
	// If a message starts with '$$', treat it as a command
	} else if (message.content.startsWith("$$")) {
		handleCommand(client, message);

	} else {
		if (isPokerollMessage(message)) {
			console.log("[handleMessage] saving Pokeroll message...");
			db.insertPokerolls(message.guild.id, parsePokeroll(message));
		}
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
 * @returns {(string|undefined)}
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
