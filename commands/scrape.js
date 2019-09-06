
const Discord = require('discord.js');
const Snow = Discord.SnowflakeUtil;
const Locks = require('locks');
const moment = require('moment');

const db = require('../database/database');

const isPokerollMessage = require('../lib/message/isPokerollMessage');
const msgDateCmp = require('../lib/message/msgDateCmp');
const parsePokeroll = require('../lib/message/parsePokeroll');

const mutex = new Locks.Mutex();

/**
 * @typedef {import('../types/pokeroll').Pokeroll} Pokeroll
 */

/**
 * @typedef {Object} DateRange
 * @property {Date} start 
 * @property {Date} end 
 */

/**
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @returns {(DateRange|undefined)}
 */
const parseArgs = (message, args) => {
	const regex = new RegExp([
		/^/,
		/\$scrape/,
		/\s+/,
		// milliseconds optional
		/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)/,
		/\s+/,
		// milliseconds optional
		/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)/,
		/$/,
	].map(re => re.source).join(""));
	
	try {
		const match = message.content.match(regex);
		const start = moment(match[1]);
		const end = moment(match[2]);
		if (start.isValid() && end.isValid()) {
			return { start: start.toDate(), end: end.toDate() };
		} else {
			return undefined;
		}
	} catch (e) {
		return undefined;
	}
}

/**
 * Command: $scrape <start date> <end date>
 * 
 * Scrapes  the message history of the current channel between the given
 * start and end dates for Pokerolls, and inserts them into the database
 * for that guild.
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 */
async function scrape(client, message, args) {
	const range = parseArgs(message, args);
	if (range === undefined) {
		return message.channel.send(usage());
	} else {
		message.channel.send('This may take a while...');
	}

	if (mutex.tryLock()) {
		console.log('[scrape] mutex locked');
		try {
			const pokerolls = await scrapeChannel(
				// @ts-ignore
				message.channel, range.start, range.end
			);

			db.insertPokerolls(message.guild.id,  ...pokerolls);
		} catch (err) {
			console.error(err);
		} finally {
			mutex.unlock();
			console.log('[scrape] mutex unlocked');
		}
	} else {
		console.log('[scrape] lock was already acquired');
	}
}

/**
 * 
 */
const usage = () => {
	return 'Usage: $scrape YYYY-MM-DD hh:mm:ss YYYY-MM-DD hh:mm:ss';
}

/**
 * Scrapes  the  message  history of the given channel between the given
 * start and end dates for Pokerolls. The Pokerolls are guaranteed to be
 * sorted in chronological order.
 * @param {Discord.TextChannel} channel 
 * @param {Date} start 
 * @param {Date} end 
 * @returns {Promise<Pokeroll[]>}
 */
async function scrapeChannel(channel, start, end) {
	console.log(`[scrapeChannel] scraping channel '${channel.name}' ` +
	            `between ${start} and ${end}...`);
	const pokerolls = [];
	let upTo = start;
	let count = 0;

	while (true) {
		const msgCollection = await channel.fetchMessages({
			limit: 100,
			after: Snow.generate(upTo),
		});
		for (let [id, msg] of msgCollection.sort(msgDateCmp)) {
			upTo = msg.createdAt;
			if (msg.createdAt <= end && isPokerollMessage(msg)) {
				pokerolls.push(parsePokeroll(msg));
			}
		}

		if (++count % 100 == 0) {
			console.log(`[scrapeChannel] searched ${100 * count} ` +
						`messages, date of latest message is ` +
						`${upTo.toString()}`);
		}

		if (upTo > end || msgCollection.size == 0) break;
		upTo = new Date(upTo.getTime() + 1);
	}

	return pokerolls;
}

module.exports = { scrape, scrapeChannel };
