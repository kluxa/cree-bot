
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
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
const pokerollProfile = (client, message, args) => {
	const user = parseArgs(message, args);

	if (user === undefined) {
		message.channel.send(`User not found. ${findCreeEmoji(message.guild)}`);
		return Promise.resolve();

	} else {
		const p1 = db.getUserRollCount(message.guild.id, user.id);
		const p2 = db.getUserNothingCount(message.guild.id, user.id);
		const p3 = db.getUserAllRarityCounts(message.guild.id, user.id);
		const p4 = db.getUserTopPokemon(message.guild.id, user.id, 5);

		return Promise.all([p1, p2, p3, p4]).then(res => {
			const rollCount = res[0];
			const nothingCount = res[1];
			const rarityCounts = res[2];
			const topPokemon = res[3];
			const embed = makePokerollProfileEmbed(
				user, rollCount, nothingCount,
				rarityCounts, topPokemon, message.author
			);
			message.channel.send(embed);
		})
		.catch(err => console.error(err));
	}
};

/**
 * 
 * @param {Discord.User} user 
 * @param {number} rollCount 
 * @param {number} nothingCount 
 * @param {Map<number, number>} rarityCounts 
 * @param {Map<string, number>} topPokemon 
 * @param {Discord.User} requestor
 */
const makePokerollProfileEmbed = (user, rollCount, nothingCount,
								  rarityCounts, topPokemon,
								  requestor) => {
	if (rollCount === 0) {
		return `${user.id === requestor.id ? 'You have' : `${user.username} has`} ` +
				`not rolled before!`;
	}

	// Rarity Rates
	const counts = { 1 : 0, 2 : 0, 3 : 0, 4 : 0, 5 : 0 };
	rarityCounts.forEach((count, rarity) => { counts[rarity] = count; });
	const rarityRatesField = [1, 2, 3, 4, 5].map(rarity =>
		`**${rarity}** - ${counts[rarity]}/${rollCount} ` +
		`(${(100 * counts[rarity] / rollCount).toFixed(2)}%)`
	).join("\n");

	// Top Pokémon
	const pokemon = [];
	topPokemon.forEach((count, poke) => pokemon.push(poke));
	const topPokemonField = pokemon.join(", ");

	return new Discord.RichEmbed()
		.setTitle(user.tag)
		.addField('Pokérolls',
			`**Roll count:** ${rollCount}\n` +
			`**Uncommon nothing count:** ` +
			`${nothingCount}/${rollCount} ` +
			`(${(100 * nothingCount / rollCount).toFixed(2)}%)`)
		.addField('Rarity Rates', rarityRatesField)
		.addField('Top Pokémon', topPokemonField)
		.setThumbnail(user.avatarURL);
}

module.exports = pokerollProfile;
