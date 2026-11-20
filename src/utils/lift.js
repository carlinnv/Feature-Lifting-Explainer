// The constructed feature used in sections 4.2–4.4.
export const liftFeature = (x1, x2) => x1 * x1 + x2 * x2;

// Visual scale for the z axis only. Red points reach z ≈ 5.3, which would dwarf the
// ±3.2 floor, so heights are drawn at half scale. Accuracy math always uses unscaled z.
export const Z_SCALE = 0.5;
