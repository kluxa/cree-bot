
const Discord = require('discord.js');

const db = require('../database/database');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
const topPokemonServer = (client, message, args) => {
	return db.getGuildTopPokemon(message.guild.id, 10)
		.then(pokemonCounts => {
			const counts = [];
			pokemonCounts.forEach((count, species) =>
				counts.push({ species: species, count: count })
			)
			const embed = makeGuildTopPokemonEmbed(counts, message.guild);
			message.channel.send(embed);
		})
		.catch(err => console.log(err));
}

/**
 * @typedef {Object} Count
 * @property {string} species 
 * @property {number} count 
 */

/**
 * 
 * @param {Count[]} counts 
 * @param {Discord.Guild} guild 
 */
const makeGuildTopPokemonEmbed = (counts, guild) => {
	const content = counts.map((count, index) =>
		`**${index + 1}.** ${count.species} **- ${count.count}**`
	).join("\n");

	const embed = new Discord.RichEmbed()
		.setColor('#e0880b')
		.setTitle(`🏆 ${guild.name} Top Pokémon 🏆`)
		.addField(`Top ${counts.length}`, content)
		.setThumbnail(guild.iconURL);
	
	return embed;
}

module.exports = topPokemonServer;
