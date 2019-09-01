
const Discord = require('discord.js');
const Snow = Discord.SnowflakeUtil;
const Locks = require('locks');

const isPokerollMessage = require('../lib/message/isPokerollMessage');
const parsePokerollMessage = require('../lib/message/parsePokerollMessage');

const Counter = require('../lib/counter/counter');
const dateAdd = require('../lib/date/dateAdd');
const dateMax = require('../lib/date/dateMax');

const mutex = new Locks.Mutex();

const CHANNELS = [
	{ // channel 1
		id:    "557058688737738774",
		start: new Date(2019, 2, 17),
		end:   new Date(2019, 3,  9),
	},
	{ // channel 2
		id:    "210025762793717760",
		start: new Date(2019, 2, 17),
		end:   new Date(),
	},
];

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
async function scanPokerollMessages(client, message) {
	if (mutex.tryLock()) {
		console.log("mutex locked");
		try {
			await scanChannels(client);
		} catch (error) {
			console.error(error);
		} finally {
			mutex.unlock();
			console.log("mutex unlocked");
		}
	} else {
		console.log("A scan is already taking place.");
	}
}

/**
 * 
 * @param {Discord.Client} client 
 */
async function scanChannels(client) {
	await fetchMessagesBetween(client.channels.get(CHANNELS[0].id), CHANNELS[0].start, CHANNELS[0].end);
	// await fetchMessagesBetween(client.channels.get(CHANNELS[1].id), CHANNELS[1].start, CHANNELS[1].end);
}

/**
 * 
 * @param {Discord.TextChannel} channel 
 * @param {Date} start 
 * @param {Date} end 
 */
async function fetchMessagesBetween(channel, start, end) {
	console.log(`Scanning '${channel.name}'...`);
	const rollCounts = new Counter();
	let i = 0;
	let curr = start;
	while (true) {
		messages = await channel.fetchMessages({
			limit: 100, after: Snow.generate(curr)
		});
		if (messages.size == 0) break;
		
		for (let [snowflake, message] of messages.entries()) {
			const time = Snow.deconstruct(snowflake).date;
			curr = dateAdd(dateMax(curr, time), 1);
			if (isPokerollMessage(message)) {
				const {user, rarities} = parsePokerollMessage(message);
				rollCounts.add(user.username, 1);
			}
		}
		
		if (curr.getTime() > end.getTime()) {
			break;
		}

		i++;
		if (i % 100 == 0) {
			console.log(`Scanned ${i * 100} messages, date of latest message is ${curr.toString()}`);
		}
	}
	console.log(rollCounts);
}

module.exports = scanPokerollMessages;
