// Geometry helpers for splitting 2D points with a straight line through A and B.

// Signed side of point P relative to the directed line A -> B (cross product).
export function side(A, B, P) {
	return (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);
}

// Score a line split. Each side of the line is assigned whichever class labeling
// gives the higher accuracy, so the score is "the best this line can do".
// Returns { accuracy, positiveLabel } where positiveLabel is the class on the side() > 0 side.
export function scoreSplit(A, B, points) {
	let correctIfPosBlue = 0;
	for (const p of points) {
		const s = side(A, B, { x: p.x1, y: p.x2 });
		const predicted = s > 0 ? "blue" : "red";
		if (predicted === p.label) correctIfPosBlue++;
	}
	const acc = correctIfPosBlue / points.length;
	return acc >= 0.5
		? { accuracy: acc, positiveLabel: "blue" }
		: { accuracy: 1 - acc, positiveLabel: "red" };
}

// Clip the infinite line through A, B to the square [-e, e]^2 (Liang–Barsky).
// Returns [P0, P1] or null if the line misses the square.
export function clipLineToSquare(A, B, e) {
	const dx = B.x - A.x;
	const dy = B.y - A.y;
	let t0 = -Infinity;
	let t1 = Infinity;
	const checks = [
		[-dx, A.x + e],
		[dx, e - A.x],
		[-dy, A.y + e],
		[dy, e - A.y]
	];
	for (const [p, q] of checks) {
		if (p === 0) {
			if (q < 0) return null;
		} else {
			const t = q / p;
			if (p < 0) t0 = Math.max(t0, t);
			else t1 = Math.min(t1, t);
		}
	}
	if (t0 > t1) return null;
	return [
		{ x: A.x + t0 * dx, y: A.y + t0 * dy },
		{ x: A.x + t1 * dx, y: A.y + t1 * dy }
	];
}

// Clip the square [-e, e]^2 to one side of the line (Sutherland–Hodgman, single edge).
// sign = +1 keeps side() >= 0, sign = -1 keeps side() <= 0. Returns polygon vertices.
export function clipSquareToHalfPlane(A, B, e, sign) {
	const square = [
		{ x: -e, y: -e },
		{ x: e, y: -e },
		{ x: e, y: e },
		{ x: -e, y: e }
	];
	const f = (P) => sign * side(A, B, P);
	const out = [];
	for (let i = 0; i < square.length; i++) {
		const P = square[i];
		const Q = square[(i + 1) % square.length];
		const fp = f(P);
		const fq = f(Q);
		if (fp >= 0) out.push(P);
		if ((fp >= 0) !== (fq >= 0)) {
			const t = fp / (fp - fq);
			out.push({ x: P.x + t * (Q.x - P.x), y: P.y + t * (Q.y - P.y) });
		}
	}
	return out;
}
