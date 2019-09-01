
const Discord = require('discord.js');

const isAuthorised = require('../user/isAuthorised');

/**
 * Returns  true  if the message says someone won nothing from the roll,
 * and false otherwise.
 * @param {Discord.Message} message 
 * @returns {boolean}
 */
const badRoll = message => {
    const regexp = /Congratulations.*nothing/;
    return message.content.search(regexp) !== -1 &&
           isAuthorised(message.author);
};

module.exports = badRoll;
