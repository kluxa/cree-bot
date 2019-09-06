
const Discord = require('discord.js');

const db = require('../database/database');

const findUserById = require('../lib/guild/findUserById');

/**
 * 
 * @param {Discord.Client} client
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {Promise}
 */
const nothingRateRank = (client, message, args) => {
	const p1 = db.getAllUsersNothingCount(message.guild.id);
	const p2 = db.getAllUsersRollCount(message.guild.id);
	return Promise.all([p1, p2])
		.then(res => {
			const nothingCounts = res[0];
			const rollCounts    = res[1];

			let counts = [];
			for (let [userId, rollCount] of rollCounts.entries()) {
				const user = findUserById(message.guild, userId);
				if (user === undefined) continue;

				const nothingCount = nothingCounts.get(userId);
				counts.push({
					user: user,
					rollCount: rollCount,
					nothingCount: nothingCount === undefined ? 0 : nothingCount
				});
			}

			counts = counts.filter(count => count.rollCount > 1000);
			counts.sort((a, b) => a.nothingCount / a.rollCount - b.nothingCount / b.rollCount);
			const embed = makeNothingRateRankEmbed(counts, message.author);
			message.channel.send(embed);
		})
		.catch(err => console.error(err));
};

/**
 * @typedef {Object} Count
 * @property {Discord.User} user - a user's tag
 * @property {number} rollCount - the number of rolls
 * @property {number} nothingCount - the number of times nothing was won
 */

/**
 * 
 * @param {Count[]} counts - an array of counts for each user
 * @param {Discord.User} user - the user who made the request
 * @returns {Discord.RichEmbed}
 */
const makeNothingRateRankEmbed = (counts, user) => {
	const userRanks = counts.map((count, index) =>
		`**${index + 1}.** ${count.user.tag} **- ${count.nothingCount}/${count.rollCount}** ` +
		`(${(100 * count.nothingCount / count.rollCount).toFixed(2)}%) ` +
		`(once every ${(count.rollCount / count.nothingCount).toFixed(2)} rolls)`
	).join("\n");
	const rank = 1 + counts.findIndex(count => count.user.id === user.id);

	let embed = new Discord.RichEmbed()
		.setColor('#e0880b')
		.setTitle(`🏆 Pokéslot Uncommon Nothing Rates 🏆`)
		.addField('Rankings', userRanks);
	
	if (rank !== 0) {
		embed = embed.setFooter(`You are ranked ${rank}/${counts.length}`);
	}
	
	return embed;
};

module.exports = nothingRateRank;
