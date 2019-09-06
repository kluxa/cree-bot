
/**
 * @typedef {object} Pokemon
 * @property {string} species - species name
 * @property {number} rarity - rarity
 */

/**
 * Creates a Pokemon object
 * @param {string} species 
 * @param {number} rarity 
 */
function Pokemon(species, rarity) {
	this.species = species;
	this.rarity = rarity;
}

module.exports = Pokemon;
