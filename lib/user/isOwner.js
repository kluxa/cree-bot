
const Discord = require('discord.js');

const ids = require('../../constants/ids');

/**
 * Checks if the given user is the owner of the bot.
 * @param {Discord.User} user 
 */
const isOwner = (user) => {
    return user.id === ids.ACCOMPLICE_ID;
}

module.exports = isOwner;
