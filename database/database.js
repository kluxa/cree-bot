
// require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;

const MONGO_URI = process.env.MONGO_URI;

/**
 * @typedef {import('../types/pokeroll').Pokeroll} Pokeroll
 */

/**
 * The interface to the Pokerolls database.
 * @class Database
 * @constructor
 * @private
 */
class Database {
	constructor() {
		/** @type {Map<string, Pokeroll[]>} */
		this.buffers = new Map();
		this.catchupMode = true;
		this.client = new MongoClient(MONGO_URI, {
			useNewUrlParser:    true,
			useUnifiedTopology: true,
		});
		this.db = undefined;

		this.client.connect().then(() => {
			console.log('connected to mongoDB');
			this.db = this.client.db('pokerolls');
		}).catch(err => console.error(err));
	}

	////////////////////////////////////////////////////////////////////
	// Status

	//////////////////////
	// Client Connection

	/**
	 * Checks  whether  the client is connected to the database. Returns
	 * true if so, and false otherwise.
	 */
	isConnected() {
		return this.db !== undefined;
	}

	/////////////////
	// Catchup Mode

	/**
	 * Catchup  mode  is automatically turned on when the bot starts up.
	 * During  catchup mode, all incoming Pokeroll messages are buffered
	 * while  the  bot scrapes the message history for Pokeroll messages
	 * that  it  missed  while  it  was offline. This function turns off
	 * catchup mode.
	 */
	catchupModeOff() {
		console.log('[catchupModeOff] turning off catchup mode...');
		this.catchupMode = false;
	}

	////////////////////////////////////////////////////////////////////
	// Buffering

	/**
	 * Adds Pokerolls belonging to a particular guild to the buffer.
	 * @param {string} guildId 
	 * @param  {...Pokeroll} pokerolls 
	 */
	bufferPokerolls(guildId, ...pokerolls) {
		if (this.buffers.has(guildId) === false) {
			this.buffers.set(guildId, []);
		}
		this.buffers.get(guildId).push(...pokerolls);
	}

	/**
	 * Flushes  Pokerolls  from  the specified guild from the buffer and
	 * adds them to the database.
	 * @param {string} guildId 
	 * @returns {Promise}
	 */
	flushGuildBuffer(guildId) {
		console.log(`[flushGuildBuffer] flushing buffer for guild '${guildId}'...`);
		const pokerolls = this.buffers.get(guildId);
		this.buffers.set(guildId, []);
		if (pokerolls.length === 0) return Promise.resolve();
		const timestamp = pokerolls.reduce((acc, curr) =>
			acc > curr.timestamp ? acc : curr.timestamp,
			new Date(0));
		return this.db.collection('guilds').updateOne(
			{ 'guildId': guildId },
			{
				'$push': { 'pokerolls': { '$each': pokerolls } },
				'$max': { 'lastUpdated': timestamp },
			},
			// { upsert: true } // TODO
		).catch(err => console.error(err));
	}

	////////////////////////////////////////////////////////////////////
	// Insertion

	/**
	 * Saves Pokerolls to the database. Buffers the Pokerolls instead if
	 * the client is not connected to the database yet, or if the bot is
	 * in catchup mode.
	 * @param {string} guildId  the guild in which the Pokeroll occurred
	 * @param {...Pokeroll} pokerolls  the Pokerolls
	 * @returns {Promise}
	 */
	insertPokerolls(guildId, ...pokerolls) {
		console.log(`[insertPokerolls] buffering pokerolls...`);
		this.bufferPokerolls(guildId, ...pokerolls);
		if (this.isConnected() && !this.catchupMode) {
			return this.flushGuildBuffer(guildId);
		} else {
			return Promise.resolve();
		}
	}

	////////////////////////////////////////////////////////////////////
	// Deletion

	/**
	 * Deletes all Pokerolls from the given guild from the database.
	 * @param {string} guildId 
	 */
	clearAllPokerolls(guildId) {
		return this.db.collection('guilds').updateOne(
			{ 'guildId': guildId },
			{ '$set': { 'pokerolls': [] } }
		);
	}

	////////////////////////////////////////////////////////////////////
	// Query

	/**
	 * A  wrapper  over  database  query functions. If the client hasn't
	 * connected to the database yet, ignore the query.
	 * @param {Function} queryFn  a database query function that returns
	 *                            a promise
	 * @returns {Promise}
	 */
	query(queryFn) {
		if (!this.isConnected()) {
			console.log('not connected, ignoring');
			return Promise.reject('not connected');
		} else {
			return queryFn();
		}
	}

	//////////////////////
	// Guild Information

	/**
	 * Gets  information about the guild, including the last time that a
	 * Pokeroll occurred when the bot was last active, and the ID of the
	 * channel where Pokerolls take place.
	 * @param {string} guildId 
	 * @returns {Promise<Object>}
	 */
	getGuildInformation(guildId) {
		return this.query(() =>
			this.db.collection('guilds').findOne(
				{ 'guildId': guildId },
				{ 'projection': { 'lastUpdated': 1, 'pokerollChannelId': 1 } }
			)
		);
	}

	////////////////////////////
	// Uncommon Nothing Counts

	/**
	 * Gets  the number of times a user has won nothing from a Pokeroll.
	 * @param {string} guildId
	 * @param {string} userId 
	 * @returns {Promise<number>}
	 */
	getUserNothingCount(guildId, userId) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{
					'$project': {
						'count': {
							'$size': {
								'$filter': {
									'input': '$pokerolls',
									'cond': {
										'$and': [
											{ '$eq': [ '$$this.userId', userId ] },
											{ '$eq': [ { '$size': '$$this.pokemon' }, 0 ] }
										]
									}
								}
							}
						}
					}
				},
			]).toArray().then(res => res[0].count)
		);
	}

	/**
	 * Gets  the  number of times each user on the Guild has won nothing
	 * from a Pokeroll.
	 * @param {string} guildId 
	 * @returns {Promise<Map<string, number>>}
	 */
	getAllUsersNothingCount(guildId) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$match': { 'pokerolls.pokemon': { '$size': 0 } } },
				{ '$group': { '_id': '$pokerolls.userId', 'count': { '$sum': 1 } } },
			]).toArray().then(res =>
				res.reduce((map, obj) => (map.set(obj._id, obj.count), map), new Map())
			)
		);
	}

	////////////////
	// Roll Counts

	/**
	 * Gets  the number of times a user has played the Pokeslot machine.
	 * @param {string} guildId
	 * @param {string} userId 
	 * @returns {Promise<number>}
	 */
	getUserRollCount(guildId, userId) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{
					'$project': {
						'count': {
							'$size': {
								'$filter': {
									'input': '$pokerolls',
									'cond': { '$eq': [ '$$this.userId', userId ] }
								}
							}
						}
					}
				}
			]).toArray().then(res => res[0].count)
		);
	}

	/**
	 * Gets  the  number  of times each user on the guild has played the
	 * Pokeslot machine, sorted in descending order.
	 * @param {string} guildId
	 * @returns {Promise<Map<string, number>>}
	 */
	getAllUsersRollCount(guildId) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$group': { '_id': '$pokerolls.userId', 'count': { '$sum': 1 } } },
				{ '$sort': { 'count': -1 } }
			]).toArray().then(res =>
				res.reduce((map, obj) => (map.set(obj._id, obj.count), map), new Map())	
			)
		);
	}

	//////////////////
	// Rarity Counts

	/**
	 * Gets the number of times a user has won a Pokemon of a particular
	 * rarity level from a Pokeroll.
	 * @param {string} guildId
	 * @param {string} userId 
	 * @param {number} rarity
	 * @returns {Promise<number>}
	 */
	getUserRarityCount(guildId, userId, rarity) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$match':
					{
						'pokerolls.userId': userId,
						'pokerolls.pokemon': { '$elemMatch': { 'rarity': rarity } },
					}
				},
				{ '$count': 'count' },
			]).toArray().then(res =>
				res.length === 0 ? 0 : res[0].count
			)
		);
	}

	/**
	 * Gets the number of times each user on the guild has won a Pokemon
	 * of a particular rarity level from a Pokeroll.
	 * @param {string} guildId 
	 * @param {number} rarity 
	 * @returns {Promise<Map<string, number>>}
	 */
	getAllUsersRarityCount(guildId, rarity) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$match': { 'pokerolls.pokemon': { '$elemMatch': { 'rarity': rarity } } } },
				{ '$group': { '_id': '$pokerolls.userId', 'count': { '$sum': 1 } } },
			]).toArray().then(res =>
				res.reduce((map, obj) => (map.set(obj._id, obj.count), map), new Map())
			)
		);
	}

	/**
	 * Gets  the  number of times a particular user on the guild has won
	 * a Pokemon of each rarity.
	 * @param {string} guildId 
	 * @param {string} userId 
	 * @returns {Promise<Map<number, number>>}
	 */
	getUserAllRarityCounts(guildId, userId) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$match': { 'pokerolls.userId': userId } },
				{ '$unwind': '$pokerolls.pokemon' },
				{ '$group': { '_id': '$pokerolls.pokemon.rarity', 'count': { '$sum': 1 } } },
			]).toArray().then(res =>
				res.reduce((map, obj) => (map.set(obj._id, obj.count), map), new Map())	
			)
		);
	}

	////////////////////
	// Quantity Counts

	/**
	 * Gets  the  number  of  times  a  user has won a certain number of
	 * Pokemon from a Pokeroll.
	 * @param {string} guildId 
	 * @param {string} userId 
	 * @param {number} quantity 
	 * @returns {Promise<number>}
	 */
	getUserQuantityCount(guildId, userId, quantity) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$match': {
					'pokerolls.userId': userId,
					'pokerolls.pokemon': { '$size': quantity }
				} },
				{ '$count': 'count' }
			]).toArray().then(res =>
				res.length === 0 ? 0 : res[0].count
			)
		);
	}

	/**
	 * Gets the number of times each user on the guild has won a certain
	 * number of Pokemon from a Pokeroll.
	 * @param {string} guildId 
	 * @param {number} quantity 
	 * @returns {Promise<Map<string, number>>}
	 */
	getAllUsersQuantityCount(guildId, quantity) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$match': { 'pokerolls.pokemon': { '$size': quantity } } },
				{ '$group': { '_id': '$pokerolls.userId', 'count': { '$sum': 1 } } },
			]).toArray().then(res =>
				res.reduce((map, obj) => (map.set(obj._id, obj.count), map), new Map())
			)
		);
	}

	////////////////
	// Top Pokemon

	/**
	 * @typedef {Object} PokemonCount
	 * @property {string} species 
	 * @property {number} count 
	 */

	/**
	 * Gets  the  Pokemon  most  commonly  won  by the given user on the
	 * specified guild, in descending order of occurrence.
	 * @param {string} guildId 
	 * @param {string} userId 
	 * @param {number} amount 
	 * @returns {Promise<Map<string, number>>}
	 */
	getUserTopPokemon(guildId, userId, amount) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$match': { 'pokerolls.userId': userId } },
				{ '$unwind': '$pokerolls.pokemon' },
				{ '$group': { '_id': '$pokerolls.pokemon.species', 'count': { '$sum': 1 } } },
				{ '$sort': { 'count': -1 } },
				{ '$limit': amount },
			]).toArray().then(res =>
				res.reduce((map, obj) => (map.set(obj._id, obj.count), map), new Map())	
			)
		);
	}

	/**
	 * Gets  the  most  common  Pokemon  that have been won on the guild
	 * overall.
	 * @param {string} guildId 
	 * @param {number} amount 
	 * @returns {Promise<Map<string, number>>}
	 */
	getGuildTopPokemon(guildId, amount) {
		return this.query(() =>
			this.db.collection('guilds').aggregate([
				{ '$match': { 'guildId': guildId } },
				{ '$unwind': '$pokerolls' },
				{ '$unwind': '$pokerolls.pokemon' },
				{ '$group': { '_id': '$pokerolls.pokemon.species', 'count': { '$sum': 1 } } },
				{ '$sort': { 'count': -1  } },
				{ '$limit': amount },
			]).toArray().then(res =>
				res.reduce((map, obj) => (map.set(obj._id, obj.count), map), new Map())	
			)
		);
	}
}

const db = new Database();

module.exports = db;
