
const Discord = require('discord.js');

/**
 * Checks if the given guild has a cree emoji
 * @param {Discord.Guild} guild
 * @returns {string} the guild's cree emoji as a string if it exists, or
 *                   the string "CREE" otherwise.
 */
const findCreeEmoji = guild => {
    const emoji = guild.emojis.find(emoji => emoji.name === "cree");
    if (emoji !== null) {
        return `<:${emoji.identifier}>`
    } else {
        return "CREE"
    }
}

module.exports = findCreeEmoji;
