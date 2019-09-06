
/**
 * Compares  two  dates.  Returns  a  negative number if date1 is before
 * date2,  0  if  date1  is  the same as date2, and a positive number if
 * date1 is after date2.
 * @param {Date} date1 
 * @param {Date} date2 
 */
const dateCmp = (date1, date2) => {
	return date1.getTime() - date2.getTime();
};

module.exports = dateCmp;
