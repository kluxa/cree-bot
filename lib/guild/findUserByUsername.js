
const Discord = require('discord.js');

/**
 * Searches  for  a  user with a particular username in the given guild.
 * Returns the user if found, and undefined otherwise.
 * @param {Discord.Guild} guild 
 * @param {string} username 
 * @returns {(Discord.User|undefined)}
 */
const findUserByUsername = (guild, username) => {
	const member = guild.members.find(member => member.user.username === username);
	if (member === null) {
		return undefined;
	} else {
		return member.user;
	}
};

module.exports = findUserByUsername;
