// The constructed feature used in sections 4.2–4.4.
export const liftFeature = (x1, x2) => x1 * x1 + x2 * x2;

// Visual scale for the z axis only. Red points reach z ≈ 5.3, which would dwarf the
// ±3.2 floor, so heights are drawn at half scale. Accuracy math always uses unscaled z.
export const Z_SCALE = 0.5;

// Section 4.3: a horizontal plane at height t (unscaled z) as a classifier.
// Points below the plane are predicted blue, points above are predicted red.
export function scorePlane(t, points) {
	let correct = 0;
	for (const p of points) {
		const predicted = liftFeature(p.x1, p.x2) < t ? "blue" : "red";
		if (predicted === p.label) correct++;
	}
	return { accuracy: correct / points.length, correct };
}
