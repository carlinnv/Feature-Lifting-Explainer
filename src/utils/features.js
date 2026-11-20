// Candidate constructed features for the section 4.5 challenge. Each one is the z the points
// get lifted to. `fn` is used for scoring and 3D heights, `glsl` (in terms of x = x1, y = x2)
// for the 2D decision-region shader, and `html` for labels. Keep the three in sync.
// The working feature (x1·x2) is listed last so it isn't the obvious first click.
export const FEATURES = [
	{
		id: "r2",
		html: "<i>x</i><sub>1</sub><sup>2</sup> + <i>x</i><sub>2</sub><sup>2</sup>",
		fn: (x1, x2) => x1 * x1 + x2 * x2,
		glsl: "x * x + y * y"
	},
	{
		id: "x1sq",
		html: "<i>x</i><sub>1</sub><sup>2</sup>",
		fn: (x1) => x1 * x1,
		glsl: "x * x"
	},
	{
		id: "x2sq",
		html: "<i>x</i><sub>2</sub><sup>2</sup>",
		fn: (x1, x2) => x2 * x2,
		glsl: "y * y"
	},
	{
		id: "x1x2",
		html: "<i>x</i><sub>1</sub> · <i>x</i><sub>2</sub>",
		fn: (x1, x2) => x1 * x2,
		glsl: "x * y"
	}
];

export const featureById = (id) => FEATURES.find((f) => f.id === id) ?? FEATURES[0];

// Min/max of the feature over the dataset (used for the plane slider range and z scale).
export function featureRange(points, fn) {
	let min = Infinity;
	let max = -Infinity;
	for (const p of points) {
		const v = fn(p.x1, p.x2);
		if (v < min) min = v;
		if (v > max) max = v;
	}
	return { min, max };
}

// A horizontal plane at height t as a classifier on feature fn. Each side of the plane gets
// whichever class labeling scores higher (as with 4.1's line), because for some features
// the blue points end up above the plane rather than below it.
// Returns { correct, aboveLabel } where aboveLabel is the class predicted for f > t.
export function scoreThreshold(points, fn, t) {
	let correctIfAboveBlue = 0;
	for (const p of points) {
		const predicted = fn(p.x1, p.x2) > t ? "blue" : "red";
		if (predicted === p.label) correctIfAboveBlue++;
	}
	const n = points.length;
	return correctIfAboveBlue >= n - correctIfAboveBlue
		? { correct: correctIfAboveBlue, aboveLabel: "blue" }
		: { correct: n - correctIfAboveBlue, aboveLabel: "red" };
}
