
/**
 * Get the overlay interval beetwen two time interval.
 * 
 * @param  {time interval} intervalA Array like [start, end]
 * @param  {time interval} intervalB Array like [start, end]
 * 
 * @return {time interval} or {empty}.
 */
function overlay(intervalA, intervalB, gap) {

	var startA = sanitize(intervalA[0]),
			endA = sanitize(intervalA[1]),
			startB = sanitize(intervalB[0]),
			endB = sanitize(intervalB[1]),
			startOverlay,
			endOverlay,
			overlay = true,
			GAP = gap === 0 || gap ? gap : 30 * 60 * 1000; //30min

	if (startA <= startB && endB <= endA) {
		startOverlay = startB;
		endOverlay = endB;
	} else if (startB <= startA && endA <= endB) {
		startOverlay = startA;
		endOverlay = endA;
	} else if (startA <= startB && startB <= endA + GAP) {
		startOverlay = startB;
		endOverlay = endA;
	} else if (startB <= startA && startA <= endB + GAP) {
		startOverlay = startA;
		endOverlay = endB;
	} else {
		overlay = false;
	}
	return {
		overlay: overlay,
		duration: endOverlay - startOverlay,
		start: Math.min(startOverlay, endOverlay),
		end: Math.max(startOverlay, endOverlay)
	};

}

function sanitize(date) {
	return date instanceof Date ? date.getTime() : (new Date(date)).getTime();
}

module.exports = {
	overlay: overlay
};
