
/**
 * Get the overlay interval beetwen two time interval.
 * 
 * @param  {time interval} intervalA Array like [start, end]
 * @param  {time interval} intervalB Array like [start, end]
 * 
 * @return {time interval} or {empty}.
 */
function overlay (intervalA, intervalB) {
	
	var startA = sanitize(intervalA[0]),
	endA = sanitize(intervalA[1]),
	startB = sanitize(intervalB[0]),
	endB = sanitize(intervalB[1]),
	startOverlay,
	endOverlay,
	duration = null;
	
	if (startA <= startB && endB <= endA) {
		startOverlay = startB;
		endOverlay = endB;
	} else if (startB <= startA && endA <= endB) {
		startOverlay = startA;
		endOverlay = endA;
	} else if (startA <= startB && startB <= endA) {
		startOverlay = startB;
		endOverlay = endA;
	} else if (startB <= startA && startA <= endB) {
		startOverlay = startA;
		endOverlay = endB;
	} else {
		duration = 0;
	}
	
	if (duration === null) {
		duration = endOverlay - startOverlay;
	}
	
	return {
		duration: duration,
		start: startOverlay,
		end: endOverlay
	};
	
}

function sanitize(date) {
	return date instanceof Date ? date : new Date(date);
}

module.exports = {
	overlay : overlay
};
