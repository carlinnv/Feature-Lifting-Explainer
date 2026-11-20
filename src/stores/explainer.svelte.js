// Shared state between the Threlte scene (left) and the step text (right).
import { circles } from "$data/circles.js";
import { scoreSplit } from "$utils/linearSplit.js";
import { scorePlane } from "$utils/lift.js";

export const COLORS = {
	blue: "#4477AA",
	red: "#EE6677"
};

// Section 4.1: the user-draggable line, defined by two handle positions.
export const line = $state({
	A: { x: -2.6, y: -1.4 },
	B: { x: 2.6, y: 1.0 }
});

export const lineScore = {
	get current() {
		return scoreSplit(line.A, line.B, circles);
	}
};

// Section 4.3: height of the horizontal separating plane, in unscaled z units.
// Starts low (below most blue points) so the user has to find the split.
export const PLANE_MIN = 0;
export const PLANE_MAX = 6;
export const plane = $state({ t: 0.3 });

export const planeScore = {
	get current() {
		return scorePlane(plane.t, circles);
	}
};
