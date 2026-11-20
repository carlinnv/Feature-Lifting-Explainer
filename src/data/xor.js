// Fixed "XOR" dataset for the section 4.5 challenge: blue points in the top-right and
// bottom-left quadrants, red points in the other two. Generated from a seeded PRNG, so
// every visitor sees exactly the same points.
//
// The radial feature from earlier (x1² + x2²) can't separate it, but z = x1·x2 can:
// x1·x2 > 0 for blue quadrants and < 0 for red ones. Points keep at least MIN_C away from
// both axes so that split has a visible margin.
// Coordinates stay inside the same plot extent as the circles dataset.

const SEED = 4505;
const N_PER_QUADRANT = 25;
const MIN_C = 0.45;
const MAX_C = 2.8;

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
	const coord = () => MIN_C + (MAX_C - MIN_C) * rand();
	const quadrants = [
		{ sx: 1, sy: 1, label: "blue" },
		{ sx: -1, sy: -1, label: "blue" },
		{ sx: -1, sy: 1, label: "red" },
		{ sx: 1, sy: -1, label: "red" }
	];
	const points = [];
	for (const q of quadrants) {
		for (let i = 0; i < N_PER_QUADRANT; i++) {
			points.push({ x1: q.sx * coord(), x2: q.sy * coord(), label: q.label });
		}
	}
	return points;
}

export const xor = generate();
