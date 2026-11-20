// Shared state between the Threlte scenes (left) and the step text (right).
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
