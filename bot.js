
const Discord = require('discord.js');

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Ready! (Username: ${client.user.username}, ID: ${client.user.id})`);
});

client.on('message', (message) => {
    if (shouldCree(message)) {
        message.channel.send(findCreeEmoji(message.guild));
    }
});

/**
 * Returns true if the bot should CREE in response to the given message,
 * and false otherwise.
 * @param {Message} message - a Message object
 * @returns {boolean}
 */
function shouldCree(message) {
    return userCanTriggerCree(message.author) &&
           messageContentCanTriggerCree(message.content);
}

/**
 * Returns  true  if the bot is allowed to CREE in response to the given
 * user, and false otherwise.
 * @param {User} user - a User object
 * @returns {boolean}
 */
function userCanTriggerCree(user) {
    return user.id === "551329384783544321" || // Mudae
           user.id === "139348983146479616" || // Mudamaid 17
           user.id === "139348983146479616"    // Me
}

/**
 * Returns  true if the given message content string can trigger a CREE,
 * and false otherwise. 
 * @param {string} content - the contents of a message
 * @returns {boolean}
 */
function messageContentCanTriggerCree(content) {
    return content.match(/Congratulations.*nothing/) !== null;
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
