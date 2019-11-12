
const Discord = require('discord.js');

const regexps = require('../../constants/regexps');

const findUserByUsername = require('../guild/findUserByUsername');

const Pokemon = require('../../types/pokemon');
const Pokeroll = require('../../types/pokeroll');

/**
 * Converts a Discord message to a Pokeroll. Assumes that the message is
 * a Pokeroll outcome message.
 * @param {Discord.Message} message 
 * @returns {Pokeroll}
 */
const parsePokeroll = message => {
	let user;
	if (message.mentions.users.size > 0) {
		user = message.mentions.users.first();
	} else {
		const match = message.content.match(/^(.*?):/);
		const username = match[1];
		user = findUserByUsername(message.guild, username);
		if (user === undefined) {
			throw Error('undefined user???')
		}
	}
	const pokemon = [1, 2, 3, 4, 5].map(rarity => {
		const match = message.content.match(regexps[rarity]);
		if (match !== null) {
			return new Pokemon(match[1], rarity)
		} else {
			return undefined;
		}
	}).filter(obj => obj !== undefined);

	return new Pokeroll(user.id, pokemon, message.id, message.createdAt);
};

module.exports = parsePokeroll;
