
const Discord = require('discord.js');
const Locks = require('locks');

const help = require('./help');
const nothingRate = require('./nothingRate');
const nothingRateRank = require('./nothingRateRank');
const quantityRate = require('./quantityRate');
const quantityRateRank = require('./quantityRateRank');
const pokerollProfile = require('./pokerollProfile');
const rarityRate = require('./rarityRate');
const rarityRateRank = require('./rarityRateRank');
const rollCount = require('./rollCount');
const rollCountRank = require('./rollCountRank');
const topPokemon = require('./topPokemon');
const topPokemonServer = require('./topPokemonServer');

const clearAll = require('./clearAll');
const scrape = require('./scrape').scrape;

const isOwner = require('../lib/user/isOwner');

const commandMutex = new Locks.Mutex();

const OWNER_COMMANDS = ["$$clearall", "$$scrape"];

/**
 * Handles a message that begins with a '$'.
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
const handleCommand = (client, message) => {
	const words = message.content.split(/\s+/);
	const args = words.slice(1);

	let cmd = undefined;
	switch (words[0].toLowerCase()) {
		case "$$h":
		case "$$help":
			cmd = () => help(client, message, args);             break;

		case "$$nr":
		case "$$nothingrate":
			cmd = () => nothingRate(client, message, args);      break;
		
		case "$$nrr":
		case "$$nothingraterank":
			cmd = () => nothingRateRank(client, message, args);  break;
		
		case "$$pp":
		case "$$pprofile":
			cmd = () => pokerollProfile(client, message, args);  break;
		
		case "$$qr":
		case "$$quantityrate":
			cmd = () => quantityRate(client, message, args);     break;
		
		case "$$qrr":
		case "$$quantityraterank":
			cmd = () => quantityRateRank(client, message, args); break;

		case "$$rc":
		case "$$rollcount":
			cmd = () => rollCount(client, message, args);        break;

		case "$$rcr":
		case "$$rollcountrank":
			cmd = () => rollCountRank(client, message, args);    break;

		case "$$rr":
		case "$$rarityrate":
			cmd = () => rarityRate(client, message, args);       break;
		
		case "$$rrr":
		case "$$rarityraterank":
			cmd = () => rarityRateRank(client, message, args);   break;
		
		case "$$tp":
		case "$$toppokemon":
			cmd = () => topPokemon(client, message, args);       break;

		case "$$tps":
		case "$$toppokemonserver":
			cmd = () => topPokemonServer(client, message, args); break;

		// owner commands
		case "$$clearall":
			cmd = () => clearAll(client, message, args);         break;
		
		case "$$scrape":
			cmd = () => scrape(client, message, args);           break;	
	}

	if (cmd !== undefined) {
		if (!OWNER_COMMANDS.includes(words[0]) || isOwner(message.author)) {
			if (commandMutex.tryLock()) {
				cmd()
					.then(() => commandMutex.unlock())
					.catch(err => console.error(err));
			}
		}
	}
};

module.exports = handleCommand;
