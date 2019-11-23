
const Discord = require('discord.js');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
const help = (client, message, args) => {
	return message.channel.send(
		'**$$h** - show this help message\n' +
		'**$$lr <rarity (1-5)> [user (optional)]** - when did you last win a Pokemon of a particular rarity?\n' +
		'**$$nr [user (optional)]** - find out how often you have won nothing\n' +
		'**$$nrr** - how good are you at winning nothing compared to other guild members?\n' +
		'**$$pp [user (optional)]** - Pokéroll profile\n' +
		'**$$qr <quantity (0-5)> [user (optional)]** - find out how often you have won a certain number of Pokémon\n' +
		'**$$qrr <quantity (0-5)>** - how good are you at winning a certain number of Pokémon from a single Pokéroll?\n' +
		'**$$rr [rarity (1-5) (optional)] [user (optional)]** - find out how often you have won a Pokémon of a particular rarity\n' +
		'**$$rrr <rarity (1-5)>** - how good are you at winning Pokémon of a particular rarity compared to other guild members?\n' +
		'**$$rc [user (optional)]** - how many times have you played the Pokéslot?\n' +
		'**$$rcr** - roll count leaderboard\n' +
		'**$$tp [user (optional)]** - which Pokémon have you won the most?\n' +
		'**$$tps** - which Pokémon have been won the most across the entire guild?\n'
	);
};

module.exports = help;
