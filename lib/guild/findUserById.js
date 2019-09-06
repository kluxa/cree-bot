
const Discord = require('discord.js');

/**
 * Searches  for a user with a particular ID in the given guild. Returns
 * the user if found, and undefined otherwise.
 * @param {Discord.Guild} guild 
 * @param {string} id 
 * @returns {(Discord.User|undefined)}
 */
const findUserById = (guild, id) => {
	const member = guild.members.find(member => member.user.id === id);
	if (member === null) {
		return undefined;
	} else {
		return member.user;
	}
};

module.exports = findUserById;
