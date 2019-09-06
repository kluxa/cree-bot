
const Discord = require('discord.js');

const db = require('../database/database');

const findCreeEmoji = require('../lib/guild/findCreeEmoji');
const findUserById = require('../lib/guild/findUserById');
const findUserByTag = require('../lib/guild/findUserByTag');

/**
 * Determines  the  user   that is being queried in the command. Returns
 * the user if found, or undefined otherwise.
 * @param {Discord.Message} message
 * @param {string[]} args
 * @returns {Discord.User}
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
 * Executes the '$nothingrate' command, which gets the number of times a
 * user has won nothing from a Pokeroll, and displays it to the channel.
 * If  a  user  is  not  specified, it defaults to the user who sent the
 * command.
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {Promise}
 */
const nothingRate = (client, message, args) => {
	const user = parseArgs(message, args);

	if (user === undefined) {
		message.channel.send(`User not found. ${findCreeEmoji(message.guild)}`);
		return Promise.resolve();
	}

	const p1 = db.getUserNothingCount(message.guild.id, user.id);
	const p2 = db.getUserRollCount(message.guild.id, user.id);
	return Promise.all([p1, p2])
		.then(res => {
			const nothingCount = res[0];
			const rollCount    = res[1];
			if (nothingCount === 0) {
				message.channel.send(
					`${user.id === message.author.id ?
						"You have " :
						`${user.username} has `}` +
					`never won an uncommon nothing!`
				);
			} else {
				message.channel.send(
					`${user.id === message.author.id ?
						"You have " :
						`${user.username} has `}` +
					`won an uncommon nothing in ` +
					`**${nothingCount}/${rollCount}** rolls. ` +
					`That's about once every ` +
					`**${(rollCount / nothingCount).toFixed(2)}** rolls!`
				);
			}
		})
		.catch(err => console.error(err));
};

module.exports = nothingRate;
