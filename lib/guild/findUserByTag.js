
const Discord = require('discord.js');

/**
 * Searches for a user with a particular tag in the given guild. Returns
 * the user if found, and undefined otherwise.
 * @param {Discord.Guild} guild 
 * @param {string} tag 
 * @returns {(Discord.User|undefined)}
 */
const findUserByTag = (guild, tag) => {
	const member = guild.members.find(member => member.user.tag === tag);
	if (member === null) {
		return undefined;
	} else {
		return member.user;
	}
};

module.exports = findUserByTag;
