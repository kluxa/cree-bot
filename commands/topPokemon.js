
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
 * Executes the '$toppokemon' command, which gets the Pokemon a user has
 * won  the  most,  and  displays  it  to  the channel. If a user is not
 * specified, it defaults to the user who sent the command.
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {Promise}
 */
const topPokemon = (client, message, args) => {
	const user = parseArgs(message, args);
	
	if (user === undefined) {
		message.channel.send(`User not found. ${findCreeEmoji(message.guild)}`);
		return Promise.resolve();

	} else {
		return db.getUserTopPokemon(message.guild.id, user.id, 10)
			.then(pokemonCounts => {
				if (pokemonCounts.size === 0) {
					message.channel.send(`${user.username} has never ` +
					                     `rolled a Pokémon!`);
				} else {
					const counts = [];
					pokemonCounts.forEach((count, species) =>
						counts.push({ species: species, count: count })
					)
					const embed = makeUserTopPokemonEmbed(counts, user);
					message.channel.send(embed);
				}
			})
			.catch(err => console.log(err));
	}
};

/**
 * @typedef {Object} Count
 * @property {string} species - Pokemon species name
 * @property {number} count - the number of times the species has occurred
 */

/**
 * 
 * @param {Count[]} counts 
 * @param {Discord.User} user 
 */
const makeUserTopPokemonEmbed = (counts, user) => {
	const content = counts.map((count, index) =>
		`**${index + 1}.** ${count.species} **- ${count.count}**`
	).join("\n");

	const embed = new Discord.RichEmbed()
		.setColor('#e0880b')
		.setTitle(`🏆 ${user.username}'s Top Pokémon 🏆`)
		.addField(`Top ${counts.length}`, content)
		.setThumbnail(user.displayAvatarURL);
	
	return embed;
}

module.exports = topPokemon;
