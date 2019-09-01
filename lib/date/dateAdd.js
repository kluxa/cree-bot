
/**
 * Adds a given amount of time to a date
 * @param {Date} date 
 * @param {Number} seconds 
 * @param {Number} minutes 
 * @param {Number} hours 
 * @param {Number} days 
 * @param {Number} months 
 * @param {Number} years 
 */
const dateAdd = (date, milliseconds, seconds = 0, minutes = 0, hours = 0, days = 0, months = 0, years = 0) => {
	return new Date(date.getFullYear() + years,
					date.getMonth() + months,
					date.getDate() + days,
					date.getHours() + hours,
					date.getMinutes() + minutes,
					date.getSeconds() + seconds,
					date.getMilliseconds() + milliseconds);
};

module.exports = dateAdd;
