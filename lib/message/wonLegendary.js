
const Discord = require('discord.js');

const isAuthorised = require('../user/isAuthorised');

/**
 * Returns  true  if the message says someone won a legendary, and false
 * otherwise.
 * @param {Discord.Message} message 
 * @returns {boolean}
 */
const wonLegendary = message => {
    const regexp = /CASINO!!! COME BACK NOW!!!/;
    return message.content.search(regexp) !== -1 &&
           isAuthorised(message.author);
};

module.exports = wonLegendary;
