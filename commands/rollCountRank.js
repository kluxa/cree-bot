
const Discord = require('discord.js');

const db = require('../database/database');

const findUserById = require('../lib/guild/findUserById');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
const rollCountRank = (client, message, args) => {
	return db.getAllUsersRollCount(message.guild.id)
		.then(rollCounts => {
			const counts = [];
			for (let [userId, count] of rollCounts.entries()) {
				const user = findUserById(message.guild, userId);
				if (user !== undefined) {
					counts.push({ user: user, count: count });
				}
			}
			
			const embed = makeRollCountRankEmbed(counts, message.author);
			message.channel.send(embed);
		})
		.catch(err => console.error(err));
};

/**
 * @typedef {Object} Count
 * @property {Discord.User} user - a user
 * @property {number} count - the number of rolls the user has made
 */

/**
 * 
 * @param {Count[]} counts - an array of counts for each user
 * @param {Discord.User} user - the user who made the request
 */
const makeRollCountRankEmbed = (counts, user) => {
	const userRanks = counts.map((count, index) =>
		`**${index + 1}.** ${count.user.tag} **- ${count.count}**`
	).join("\n");
	const rank = 1 + counts.findIndex(count => count.user.id === user.id);

	let embed = new Discord.RichEmbed()
		.setColor('#e0880b')
		.setTitle('🏆 Pokéslot Roll Counts 🏆')
		.addField('Rankings', userRanks);
	
	if (rank !== 0) {
		embed = embed.setFooter(`You are ranked ${rank}/${counts.length}`);
	}
	
	return embed;
};

module.exports = rollCountRank;
