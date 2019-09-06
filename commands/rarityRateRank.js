
const Discord = require('discord.js');

const db = require('../database/database');

const findUserById = require('../lib/guild/findUserById');

/**
 * 
 * @param {string[]} args 
 * @returns {number}
 */
const parseArgs = (args) => {
	if (args.length === 0) {
		return undefined;
	}

	const rarity = parseInt(args[0]);
	return (isNaN(rarity) || rarity < 1 || rarity > 5 ? undefined : rarity);
};

/**
 * 
 * @param {Discord.TextChannel|Discord.DMChannel|Discord.GroupDMChannel} channel 
 */
const usage = (channel) => {
	return channel.send("Usage: <$$rarityraterank|$$rrr> <1|2|3|4|5>");
}

/**
 * 
 * @param {Discord.Client} client
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {Promise}
 */
const rarityRateRank = (client, message, args) => {
	const rarity = parseArgs(args);
	if (rarity === undefined) return usage(message.channel);

	const p1 = db.getAllUsersRarityCount(message.guild.id, rarity);
	const p2 = db.getAllUsersRollCount(message.guild.id);
	return Promise.all([p1, p2])
		.then(res => {
			const rarityCounts = res[0];
			const rollCounts   = res[1];
			let counts = [];
			for (let [userId, rollCount] of rollCounts.entries()) {
				const user = findUserById(message.guild, userId);
				if (user === undefined) continue;

				const rarityCount = rarityCounts.get(userId);
				counts.push({
					user: user,
					rollCount: rollCount,
					rarityCount: rarityCount === undefined ? 0 : rarityCount,
				});
			}

			counts = counts.filter(count => count.rollCount > 1000);
			counts.sort((a, b) => b.rarityCount / b.rollCount - a.rarityCount / a.rollCount);
			const embed = makeRarityCountRankEmbed(rarity, counts, message.author);
			message.channel.send(embed);
		})
		.catch(err => console.error(err));
};

/**
 * @typedef {Object} Count
 * @property {Discord.User} user - a user's tag
 * @property {number} rollCount - the number of rolls
 * @property {number} rarityCount - the number of times a rarity was won
 */

/**
 * 
 * @param {Count[]} counts - an array of counts for each user
 * @param {Discord.User} user - the user who made the request
 * @returns {Discord.RichEmbed}
 */
const makeRarityCountRankEmbed = (rarity, counts, user) => {
	const userRanks = counts.map((count, index) =>
		`**${index + 1}.** ` +
		`${count.user.tag} ` +
		`**- ${count.rarityCount}/${count.rollCount}** ` +
		`(${(100 * count.rarityCount / count.rollCount).toFixed(2)}%) ` +
		`(one every ${(count.rollCount / count.rarityCount).toFixed(2)} rolls)`
	).join("\n");
	const rank = 1 + counts.findIndex(count => count.user.id === user.id);

	let embed = new Discord.RichEmbed()
		.setColor('#e0880b')
		.setTitle(`🏆 Pokéslot Tier ${rarity} Rates 🏆`)
		.addField('Rankings', userRanks);
	
	if (rank !== 0) {
		embed = embed.setFooter(`You are ranked ${rank}/${counts.length}`);
	}
	
	return embed;
};

module.exports = rarityRateRank;
