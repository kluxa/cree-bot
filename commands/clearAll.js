
const Discord = require('discord.js');

const db = require('../database/database');

/**
 * $clearall
 * 
 * An owner-only command that clears all saved Pokerolls for the current
 * guild from the database.
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
const clearAll = (client, message, args) => {
	message.channel.send('Clearing all saved Pokerolls...');
	return db.clearAllPokerolls(message.guild.id);
}

module.exports = clearAll;
