// Fixed "circles" dataset: a blue cluster at the origin surrounded by a ring of red points.
// Generated from a seeded PRNG, so every visitor sees exactly the same points.
// The gap between the blue radius (<= BLUE_MAX_R) and the red ring (>= RED_MIN_R) is what
// lets the lifted feature z = x1^2 + x2^2 separate the classes perfectly in section 4.3.

export const EXTENT = 3.2; // plot spans [-EXTENT, EXTENT] on both axes

const SEED = 375;
const N_PER_CLASS = 50;
const BLUE_MAX_R = 1.5;
const BLUE_SIGMA = BLUE_MAX_R / 2; // spread of the Gaussian blue cluster
const RED_MIN_R = 1.9;
const RED_MAX_R = 2.3;

// mulberry32: small deterministic PRNG
function mulberry32(a) {
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function generate() {
	const rand = mulberry32(SEED);
	const points = [];

	for (let i = 0; i < N_PER_CLASS; i++) {
		// Gaussian scatter (Box–Muller), dense near the origin with a few stragglers;
		// resample anything past BLUE_MAX_R so the gap to the red ring is preserved.
		let x1, x2;
		do {
			const m = Math.sqrt(-2 * Math.log(1 - rand()));
			const theta = rand() * 2 * Math.PI;
			x1 = BLUE_SIGMA * m * Math.cos(theta);
			x2 = BLUE_SIGMA * m * Math.sin(theta);
		} while (Math.hypot(x1, x2) > BLUE_MAX_R);
		points.push({ x1, x2, label: "blue" });
	}

	for (let i = 0; i < N_PER_CLASS; i++) {
		const r = RED_MIN_R + (RED_MAX_R - RED_MIN_R) * rand();
		const theta = rand() * 2 * Math.PI;
		points.push({ x1: r * Math.cos(theta), x2: r * Math.sin(theta), label: "red" });
	}

	return points;
}

export const circles = generate();
