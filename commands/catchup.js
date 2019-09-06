
const Discord = require('discord.js');

const db = require('../database/database');

const scrapeChannel = require('./scrape').scrapeChannel;

const parsePokeroll = require('../lib/message/parsePokeroll');

/**
 * This  function  should  be  called  from the ready function. For each
 * guild,  it scrapes the message history starting from the time it last
 * updated information related to that guild, and adds Pokerolls that it
 * missed to the database.
 * @param {Discord.Client} client 
 */
function catchup(client) {
	const now = new Date();
	catchupTo(client, now);
}

/**
 * Does most of the work
 * @param {Discord.Client} client 
 * @param {Date} end 
 */
async function catchupTo(client, end) {
	if (!db.isConnected()) {
		setTimeout(() => catchupTo(client, end), 1000);
		return;
	}

	for (const guild of client.guilds.values()) {
		const guildInfo = await db.getGuildInformation(guild.id);
		const channelId = guild.channels.get(guildInfo.pokerollChannelId);
		const startDate = new Date(guildInfo.lastUpdated.getTime() + 1);

		// @ts-ignore (ignore warnings about TextChannel)
		const pokerolls = await scrapeChannel(channelId,
											  startDate, end);
		await db.insertPokerolls(guild.id, ...pokerolls);
		db.flushGuildBuffer(guild.id);
	}

	db.catchupModeOff();
};

module.exports = catchup;
