
const Discord = require('discord.js');

const regexps = require('../constants/regexps');

/**
 * 
 * @param {Discord.Message} message 
 * @returns {Discord.User, [Number]}
 */
const parsePokerollMessage = message => {
	user = message.mentions.users.first();
	rarities = [1, 2, 3, 4, 5].filter(rarity =>
		message.content.match(regexps[rarity])
	);
	return { user, rarities };
};

module.exports = parsePokerollMessage;
