
class Counter {
	constructor() {
		this.counts = {};
	}

	add(key, amount) {
		if (this.counts[key] === undefined) {
			this.counts[key] = 0;
		}
		this.counts[key] += amount;
	}

}

module.exports = Counter;
