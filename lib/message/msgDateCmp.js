
const Discord = require('discord.js');

const dateCmp = require('../date/dateCmp');

/**
 * Compares  two  Discord  messages  based  on  the time they were sent.
 * Returns  a  negative  number  if msg1 was sent before msg2, 0 if they
 * were  sent  at  the same time, and a positive number if msg1 was sent
 * after msg2.
 * @param {Discord.Message} msg1 
 * @param {Discord.Message} msg2
 * @returns {number}
 */
const msgDateCmp = (msg1, msg2) => {
	return dateCmp(msg1.createdAt, msg2.createdAt);
};

module.exports = msgDateCmp;
