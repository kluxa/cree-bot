
const Discord = require('discord.js');

const db = require('../database/database');

const findUserById = require('../lib/guild/findUserById');
const findUserByTag = require('../lib/guild/findUserByTag');

/**
 * @typedef {Object} RarityUser
 * @property {number} rarity 
 * @property {Discord.User} user 
 */

/**
 * 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {RarityUser}
 */
const parseArgs = (message, args) => {
	if (args.length === 0) {
		return { rarity: undefined, user: undefined };
	}
	const rarity = parseInt(args[0]);
	if (isNaN(rarity) || rarity < 1 || rarity > 5) {
		return { rarity: undefined, user: undefined };
	}

	let user = message.author;
	if (args[1] !== undefined) {
		// check ID
		if (args[1].match(/^\d+$/)) {
			user = findUserById(message.guild, args[1]);
		// then check tag
		} else if (args[1].match(/^.*#\d+$/)) {
			user = findUserByTag(message.guild, args[1]);
		}
	}

	return { rarity: rarity, user: user };
}

/**
 * Displays a usage message for the $rarityrate command to the channel.
 * @param {(Discord.TextChannel|Discord.DMChannel|Discord.GroupDMChannel)} channel 
 */
const usage = (channel) => {
	return channel.send("Usage: <$rarityrate|$$rr> <1|2|3|4|5> [user (optional)]");
}

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {Promise}
 */
const rarityRate = (client, message, args) => {
	if (args.length === 0) {
		return allRarityRates(client, message, args);
	}

	const { rarity, user } = parseArgs(message, args);
	if (rarity === undefined || user === undefined) {
		return usage(message.channel);
	}

	const p1 = db.getUserRollCount(message.guild.id, user.id);
	const p2 = db.getUserRarityCount(message.guild.id, user.id, rarity);
	return Promise.all([p1, p2])
		.then(res => {
			const rollCount   = res[0];
			const rarityCount = res[1];
			if (rarityCount === 0) {
				message.channel.send(
					`${user.id === message.author.id ?
						"You have " :
						`${user.username} has `}` +
					`never won a tier ${rarity} Pokémon!`
				);
			} else {
				message.channel.send(
					`${user.id === message.author.id ?
						"You have " :
						`${user.username} has `}` +
					`won a tier ${rarity} Pokémon in ` +
					`**${rarityCount}/${rollCount}** rolls. ` +
					`That's about one tier ${rarity} Pokémon every ` +
					`**${(rollCount / rarityCount).toFixed(2)}** rolls!`
				);
			}
		})
		.catch(err => console.error(err));
}

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
const allRarityRates = (client, message, args) => {
	const p1 = db.getUserRollCount(message.guild.id, message.author.id);
	const p2 = db.getUserAllRarityCounts(message.guild.id, message.author.id);
	return Promise.all([p1, p2]).then(res => {
		const rollCount    = res[0];
		const rarityCounts = res[1];
		console.log(rarityCounts);
		const counts = {1 : 0, 2 : 0, 3 : 0, 4 : 0, 5 : 0};
		rarityCounts.forEach((count, rarity) => counts[rarity] = count);
		const embed = makeAllRarityRatesEmbed(counts, rollCount, message.author);
		message.channel.send(embed);
	});
}

/**
 * 
 * @param {Object<number, number>} counts 
 * @param {number} rollCount 
 * @param {Discord.User} user 
 */
const makeAllRarityRatesEmbed = (counts, rollCount, user) => {
	const emojis = {
		1: ":one:",
		2: ":two:",
		3: ":three:",
		4: ":four:",
		5: ":five:",
	};
	const rarityRates = [1, 2, 3, 4, 5].map(rarity =>
		`**${rarity} - ${counts[rarity]}/${rollCount}** ` +
		`(${(100 * counts[rarity] / rollCount).toFixed(2)}%) ` +
		`(once every ${(rollCount / counts[rarity]).toFixed(2)} rolls)`
	).join("\n");

	const embed = new Discord.RichEmbed()
		.setColor('#e0880b')
		.setThumbnail(user.displayAvatarURL)
		.setTitle(user.tag)
		.addField('Rarity Rates', rarityRates);
	
	return embed;
};

module.exports = rarityRate;
