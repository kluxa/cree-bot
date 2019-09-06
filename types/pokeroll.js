
/**
 * @typedef {import('./pokemon').Pokemon} Pokemon
 */

/**
 * A Pokeroll outcome message
 * @typedef {object} Pokeroll
 * @property {string} userId - the ID of the user
 * @property {Pokemon[]} pokemon - the Pokemon the user won
 * @property {string} snowflake - the snowflake of the message
 * @property {Date} timestamp - the time the user won
 */

/**
 * Creates a Pokeroll object
 * @param {string} userId 
 * @param {Pokemon[]} pokemon 
 * @param {string} snowflake 
 * @param {Date} timestamp 
 */
function Pokeroll(userId, pokemon, snowflake, timestamp) {
	this.userId = userId;
	this.pokemon = pokemon;
	this.snowflake = snowflake;
	this.timestamp = timestamp;
}

module.exports = Pokeroll;
