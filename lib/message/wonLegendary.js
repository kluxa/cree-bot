
const Discord = require('discord.js');

const regexps = require('../../constants/regexps');

const isAuthorised = require('../user/isAuthorised');

/**
 * Returns  true  if the message says someone won a legendary, and false
 * otherwise.
 * @param {Discord.Message} message 
 * @returns {boolean}
 */
const wonLegendary = message => {
    return message.content.search(regexps[5]) !== -1 &&
           isAuthorised(message.author);
};

module.exports = wonLegendary;
