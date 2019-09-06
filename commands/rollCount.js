
const Discord = require('discord.js');

const db = require('../database/database');

const findCreeEmoji = require('../lib/guild/findCreeEmoji');
const findUserById = require('../lib/guild/findUserById');
const findUserByTag = require('../lib/guild/findUserByTag');

/**
 * Determines  the  user  that  is being queried in the command. Returns
 * the user if found, or undefined otherwise.
 * @param {Discord.Message} message
 * @param {string[]} args
 * @returns {(Discord.User|undefined)}
 */
const parseArgs = (message, args) => {
	let user = message.author;

	// check mentions
	if (message.mentions.users.size > 0) {
		user = message.mentions.users.first();

	} else if (args[0] !== undefined) {
		// then check ID
		if (args[0].match(/^\d+$/)) {
			user = findUserById(message.guild, args[0]);

		// then check tag
		} else if (args[0].match(/^.*#\d+$/)) {
			user = findUserByTag(message.guild, args[0]);
		}
	}
	return user;
};

/**
 * Executes  the  '$rollcount' command, which gets the number of times a
 * user  has  done a Pokeroll, and displays it to the channel. If a user
 * is not specified, it defaults to the user who sent the command.
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {Promise}
 */
const rollCount = (client, message, args) => {
	const user = parseArgs(message, args);
	
	if (user === undefined) {
		message.channel.send(`User not found. ${findCreeEmoji(message.guild)}`);
		return Promise.resolve();

	} else {
		return db.getUserRollCount(message.guild.id, user.id)
			.then(count =>
				message.channel.send(
					`${user.id === message.author.id ? "You have" : `${user.username} has`} ` +
					`rolled **${count}** ${count === 1 ? "time" : "times"}.`
				)
			)
			.catch(err => console.log(err));
	}
};

module.exports = rollCount;
