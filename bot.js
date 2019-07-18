
const Discord = require('discord.js');

const client = new Discord.Client();

const botId        = "600983903313985537";
const mudamaidId   = "551329384783544321";
const accompliceId = "139348983146479616";

client.on('ready', () => {
    console.log(`Ready! (Username: ${client.user.username}, ID: ${client.user.id})`);
});

client.on('message', (message) => {
    const response = decideResponse(message);
    if (response !== undefined) {
        message.channel.send(response);
    }
});

/**
 * Decides  a  response  to  the given message. Returns undefined if the
 * bot should not respond.
 * @param {Message} message 
 * @returns {string}
 */
function decideResponse(message) {
    if (badRoll(message)) {
        return `${findCreeEmoji(message.guild)}`;
    } else if (wonLegendary(message)) {
        return `${findCreeEmoji(message.guild)} `.repeat(3);
    } else if (creesAtMe(message)) {
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
           message.author.id === mudamaidId;
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
           message.author.id === mudamaidId;
}

/**
 * Returns  true if the message contains the cree emote and mentions the
 * bot, and false otherwise.
 * @param {Message} message 
 * @returns {boolean}
 */
function creesAtMe(message) {
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

client.login(process.env.BOT_TOKEN);
