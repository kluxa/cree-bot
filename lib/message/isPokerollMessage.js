
const Discord = require('discord.js');

const isAuthorised = require('../user/isAuthorised');
const regexps = require('../constants/regexps');

/**
 * 
 * @param {Discord.Message} message 
 */
const isPokerollMessage = message => {
	return isAuthorised(message.author) &&
		[0, 1, 2, 3, 4, 5].some(idx =>
			message.content.match(regexps[idx]) !== null
		);
};

module.exports = isPokerollMessage;
