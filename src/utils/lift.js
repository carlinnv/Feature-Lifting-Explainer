// The constructed feature used in sections 4.2–4.4.
export const liftFeature = (x1, x2) => x1 * x1 + x2 * x2;

// Visual scale for the z axis only. Red points reach z ≈ 5.3, which would dwarf the
// ±3.2 floor, so heights are drawn at half scale. Accuracy math always uses unscaled z.
export const Z_SCALE = 0.5;

// Sections 4.3–4.4: the plane z = t + tilt·x1 (unscaled z) as a classifier.
// tilt = 0 is the horizontal plane of 4.3. Points below the plane are predicted blue,
// points above are predicted red.
export function scorePlane(t, tilt, points) {
	let correct = 0;
	for (const p of points) {
		const predicted = liftFeature(p.x1, p.x2) < t + tilt * p.x1 ? "blue" : "red";
		if (predicted === p.label) correct++;
	}
	return { accuracy: correct / points.length, correct };
}

// Where the plane z = t + tilt·x1 cuts the bowl z = x1² + x2²:
//   x1² − tilt·x1 + x2² = t   ⇔   (x1 − tilt/2)² + x2² = t + tilt²/4
// i.e. a circle centred at (tilt/2, 0) with radius √(t + tilt²/4).
// This circle is the 2D decision boundary: inside = blue, outside = red.
export function planeBowlCircle(t, tilt) {
	return { cx: tilt / 2, cy: 0, r: Math.sqrt(Math.max(t + (tilt * tilt) / 4, 0)) };
}
