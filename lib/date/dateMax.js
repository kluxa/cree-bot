
/**
 * Returns the later of the two given dates.
 * @param {Date} date1 
 * @param {Date} date2 
 */
const dateMax = (date1, date2) => {
	if (date1.getTime() > date2.getTime()) {
		return date1;
	} else {
		return date2;
	}
};

module.exports = dateMax;
