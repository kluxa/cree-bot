
const cree = require('../commands/cree');

const botId        = "600983903313985537";
const mudamaidId   = "551329384783544321";
const accompliceId = "139348983146479616";

testChannelId      = "589326521840173056";

module.exports = (client, message) => {
    if (message.author.bot) return;

	words = message.content.split(/\s+/);
	
	if (message.channel.type == "dm") {
		// console.log(`Received DM: ${message.content}`);
		cree(client, message);
	
	} else if (words[0] === "$cree") {
		cree(client, message);

	} else {
		const response = decideResponse(client, message);
		if (response !== undefined) {
			message.channel.send(response);
		}
	}
};

/**
 * Decides  a  response  to  the given message. Returns undefined if the
 * bot should not respond.
 * @param {Client} client
 * @param {Message} message 
 * @returns {string}
 */
function decideResponse(client, message) {
    if (badRoll(message)) {
        return `${findCreeEmoji(message.guild)}`;
    } else if (wonLegendary(message)) {
        return `${findCreeEmoji(message.guild)} `.repeat(3);
    } else if (creesAtMe(client, message)) {
        return `${message.author} ${findCreeEmoji(message.guild)}`;
    } else {
        return undefined;
    }
}

/**
 * Returns  true  if the message says someone won nothing from the roll,
 * and false otherwise.
 * @param {Message} message 
 * @returns {boolean}
 */
function badRoll(message) {
    const regexp = /Congratulations.*nothing/;
    return message.content.search(regexp) !== -1 &&
           isAuthorised(message.author);
}

/**
 * Returns  true  if the message says someone won a legendary, and false
 * otherwise.
 * @param {Message} message 
 * @returns {boolean}
 */
function wonLegendary(message) {
    const regexp = /CASINO!!! COME BACK NOW!!!/;
    return message.content.search(regexp) !== -1 &&
           isAuthorised(message.author);
}

/**
 * Returns  true if the message contains the cree emote and mentions the
 * bot, and false otherwise.
 * @param {Client} client
 * @param {Message} message 
 * @returns {boolean}
 */
function creesAtMe(client, message) {
    return message.content.search(findCreeEmoji(message.guild)) !== -1 &&
           message.isMemberMentioned(client.user);
}

/**
 * Checks if the given guild has a cree emoji
 * @param {Guild} guild
 * @returns {string} the guild's cree emoji as a string if it exists, or
 *                   the string "CREE" otherwise.
 */
function findCreeEmoji(guild) {
    const emoji = guild.emojis.find(emoji => emoji.name === "cree");
    if (emoji !== null) {
        return `<:${emoji.identifier}>`
    } else {
        return "CREE"
    }
}

function isAuthorised(user) {
    return user.id === mudamaidId ||
           user.id === accompliceId;
}
