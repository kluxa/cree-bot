
const Discord = require('discord.js');

const ids = require('../../constants/ids');

/**
 * Checks if the given user is authorised to send a Pokeroll message.
 * @param {Discord.User} user 
 * @returns {boolean}
 */
const isAuthorised = (user) => {
    return user.id === ids.MUDAMAID_17_ID;
}

module.exports = isAuthorised;
