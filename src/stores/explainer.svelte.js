// Shared state between the Threlte scenes (left) and the step text (right).
import { circles } from "$data/circles.js";
import { scoreSplit } from "$utils/linearSplit.js";
import { scorePlane } from "$utils/lift.js";
import { xor } from "$data/xor.js";
import { FEATURES, featureById, featureRange, scoreThreshold } from "$utils/features.js";

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

// Sections 4.3–4.4: the separating plane z = t + tilt·x1, in unscaled z units.
// t starts low (below most blue points) so the user has to find the split.
// tilt is only used from section 4.4 on; 4.3 always shows and scores a horizontal plane.
// NOTE: the 4.4 tilt slider was removed for now (user decision: may cause confusion), so
// tilt stays 0. The scenes and scoring still support it for when it comes back.
// The ranges keep the plane/bowl circle inside the plot (max extent ≈ 3.12 < 3.2).
export const PLANE_MIN = 0;
export const PLANE_MAX = 6;
export const TILT_MAX = 1.2;
export const plane = $state({ t: 0.3, tilt: 0 });

export const planeScore = {
	get current() {
		return scorePlane(plane.t, 0, circles);
	}
};

// Section 4.4: whether the user has clicked "Collapse into 2D" (splits the view and clones
// the 3D scene on the right, which then collapses).
export const collapse = $state({ on: false });

// The main scene's current camera view (kept in sync by Scene.svelte), so the right-hand
// clone in 4.4 starts from exactly the angle the user was looking at. Plain object, not
// reactive: it is only read once, when the clone is created.
export const mainView = { phi: 1e-4, theta: -Math.PI / 2, tz: 0 };

export const tiltedPlaneScore = {
	get current() {
		return scorePlane(plane.t, plane.tilt, circles);
	}
};

// Section 4.5: the XOR challenge. The user picks which constructed feature z to lift the
// points with, then slides a horizontal plane z = t. Changing the feature resets t to a
// starting height 70% of the way up that feature's range (never a perfect split).
export const CHALLENGE_START = 0.7;

function startHeight(featureId) {
	const { min, max } = featureRange(xor, featureById(featureId).fn);
	return min + CHALLENGE_START * (max - min);
}

// `revealed`: the 3D view is hidden until the user first gets 100%, then shown as the
// explanation (user decision). Reset when the user scrolls back above 4.5.
export const challenge = $state({
	featureId: FEATURES[0].id,
	t: startHeight(FEATURES[0].id),
	revealed: false
});

export function selectFeature(id) {
	challenge.featureId = id;
	challenge.t = startHeight(id);
}

export const challengeScore = {
	get current() {
		return scoreThreshold(xor, featureById(challenge.featureId).fn, challenge.t);
	}
};

// Section 4.2: whether the user has clicked "Lift each point to height z" (user decision:
// the lift is triggered by a button so it's clear height is only a way to draw z).
// Reset when the user scrolls back above 4.2; set automatically if they scroll past it.
export const liftStep = $state({ lifted: false });
