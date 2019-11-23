
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

const Discord = require('discord.js');

const db = require('../database/database');

const findCreeEmoji = require('../lib/guild/findCreeEmoji');
const findUserById = require('../lib/guild/findUserById');
const findUserByTag = require('../lib/guild/findUserByTag');

/**
 * @typedef {Object} RarityUser
 * @property {number} rarity 
 * @property {Discord.User} user 
 */

/**
 * 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {RarityUser}
 */
const parseArgs = (message, args) => {
	if (args.length === 0) {
		return { rarity: undefined, user: undefined };
	}
	const rarity = parseInt(args[0]);
	if (isNaN(rarity) || rarity < 1 || rarity > 5) {
		return { rarity: undefined, user: undefined };
	}

	let user = message.author;
	if (args[1] !== undefined) {
		// check ID
		if (args[1].match(/^\d+$/)) {
			user = findUserById(message.guild, args[1]);
		// then check tag
		} else if (args[1].match(/^.*#\d+$/)) {
			user = findUserByTag(message.guild, args[1]);
		}
	}

	return { rarity: rarity, user: user };
}

/**
 * Displays a usage message for the $last command to the channel.
 * @param {(Discord.TextChannel|Discord.DMChannel|Discord.GroupDMChannel)} channel 
 */
const usage = (channel) => {
	return channel.send("Usage: $$lr <1|2|3|4|5> [user (optional)]");
}

/**
 * Executes  the  '$last' command, which gets the number of times a user
 * has won a Pokemon of a given rarity, and displays it to the  channel.
 * If  a  user  is  not  specified, it defaults to the user who sent the
 * command.
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {Promise}
 */
const lastRarityTime = (client, message, args) => {
	const { rarity, user } = parseArgs(message, args);
    
    if (rarity === undefined) {
        return usage(message.channel);
    
    } else if (user === undefined) {
		return message.channel.send(`User not found. ${findCreeEmoji(message.guild)}`);

	} else {
        return db.getLastRarityTime(message.guild.id, user.id, rarity)
            .then(time => {
                if (time == undefined) {
                    return message.channel.send(
                        `${user.id === message.author.id ? "You have" : `${user.username} has`} ` +
                        `never won a rarity ${rarity} Pokemon! ${findCreeEmoji(message.guild)}`
                    );
                } else {
                    return message.channel.send(
                        `The last time ` + 
                        `${user.id === message.author.id ? "you" : `${user.username} `} ` +
                        `won a rarity ${rarity} Pokemon was ` +
                        `${timeAgo.format(time)}.`
                    );
                }
            })
			.catch(err => console.log(err));
	}
};

module.exports = lastRarityTime;
