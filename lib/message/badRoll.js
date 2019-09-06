
const Discord = require('discord.js');

const regexps = require('../../constants/regexps');

const isAuthorised = require('../user/isAuthorised');

/**
 * Returns  true  if the message says someone won nothing from the roll,
 * and false otherwise.
 * @param {Discord.Message} message 
 * @returns {boolean}
 */
const badRoll = message => {
    return message.content.search(regexps[0]) !== -1 &&
           isAuthorised(message.author);
};

module.exports = badRoll;
