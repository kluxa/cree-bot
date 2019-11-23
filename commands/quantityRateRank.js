
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

	const quantity = parseInt(args[0]);
	return (isNaN(quantity) || quantity < 0 || quantity > 5 ? undefined : quantity);
};

/**
 * 
 * @param {Discord.TextChannel|Discord.DMChannel|Discord.GroupDMChannel} channel 
 */
const usage = (channel) => {
	return channel.send("Usage: $$quantityraterank|$$qrr <0-5>");
}

/**
 * 
 * @param {Discord.Client} client
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {Promise}
 */
const quantityRateRank = (client, message, args) => {
	const quantity = parseArgs(args);
	if (quantity === undefined) return usage(message.channel);

	const p1 = db.getAllUsersQuantityCount(message.guild.id, quantity);
	const p2 = db.getAllUsersRollCount(message.guild.id);
	return Promise.all([p1, p2])
		.then(res => {
			const quantityCounts = res[0];
			const rollCounts     = res[1];
			let counts = [];
			for (let [userId, rollCount] of rollCounts.entries()) {
				const user = findUserById(message.guild, userId);
				if (user === undefined) continue;

				const quantityCount = quantityCounts.get(userId);
				counts.push({
					user: user,
					rollCount: rollCount,
					quantityCount: quantityCount === undefined ? 0 : quantityCount,
				});
			}

			counts = counts.filter(count => count.rollCount > 200);
			counts.sort((a, b) => b.quantityCount / b.rollCount - a.quantityCount / a.rollCount);
			const embed = makeQuantityCountRankEmbed(quantity, counts, message.author);
			message.channel.send(embed);
		})
		.catch(err => console.error(err));
};

/**
 * @typedef {Object} Count
 * @property {Discord.User} user - a user's tag
 * @property {number} rollCount - the number of rolls
 * @property {number} quantityCount - the number of times the user won a certain
 *                                    quantity of Pokemon
 */

/**
 * 
 * @param {Count[]} counts - an array of counts for each user
 * @param {Discord.User} user - the user who made the request
 * @returns {Discord.RichEmbed}
 */
const makeQuantityCountRankEmbed = (quantity, counts, user) => {
	const userRanks = counts.map((count, index) =>
		`**${index + 1}.** ` +
		`${count.user.tag} ` +
		`**- ${count.quantityCount}/${count.rollCount}** ` +
		`(${(100 * count.quantityCount / count.rollCount).toFixed(2)}%) ` +
		`(once every ${(count.rollCount / count.quantityCount).toFixed(2)} rolls)`
	).join("\n");
	const rank = 1 + counts.findIndex(count => count.user.id === user.id);

	let embed = new Discord.RichEmbed()
		.setColor('#e0880b')
		.setTitle(`🏆 Pokéslot ${quantity}-Pokémon Roll Rates 🏆`)
		.addField('Rankings', userRanks);
	
	if (rank !== 0) {
		embed = embed.setFooter(`You are ranked ${rank}/${counts.length}`);
	}
	
	return embed;
};

module.exports = quantityRateRank;
