<script>
	// Section 4.1: a straight line the user drags (via two handles) to try to split the classes.
	// Each side of the line is shaded with the class it predicts.
	import { T } from "@threlte/core";
	import { BufferGeometry, BufferAttribute, Color } from "three";
	import { EXTENT } from "$data/circles.js";
	import { line, lineScore, COLORS } from "$stores/explainer.svelte.js";
	import { clipLineToSquare, clipSquareToHalfPlane } from "$utils/linearSplit.js";

	const LINE_W = 0.05;
	const HANDLE_R = 0.17;
	const MIN_HANDLE_DIST = 0.4;

	// --- half-plane shading -------------------------------------------------
	// Clipping a square by a half-plane gives at most 5 vertices, so each region uses a
	// fixed 5-vertex triangle fan; unused vertices repeat the last one (degenerate triangles).
	function makeRegionGeometry() {
		const g = new BufferGeometry();
		g.setAttribute("position", new BufferAttribute(new Float32Array(5 * 3), 3));
		g.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]);
		return g;
	}
	function updateRegion(g, poly) {
		const pos = g.attributes.position;
		for (let i = 0; i < 5; i++) {
			const v = poly[Math.min(i, poly.length - 1)] ?? { x: 0, y: 0 };
			pos.setXYZ(i, v.x, v.y, 0);
		}
		pos.needsUpdate = true;
		g.computeBoundingSphere();
	}

	const posRegion = makeRegionGeometry();
	const negRegion = makeRegionGeometry();

	const score = $derived(lineScore.current);
	const posColor = $derived(new Color(COLORS[score.positiveLabel]));
	const negColor = $derived(new Color(COLORS[score.positiveLabel === "blue" ? "red" : "blue"]));

	$effect(() => {
		updateRegion(posRegion, clipSquareToHalfPlane(line.A, line.B, EXTENT, 1));
		updateRegion(negRegion, clipSquareToHalfPlane(line.A, line.B, EXTENT, -1));
	});

	// --- the visible line segment, clipped to the plot -----------------------
	const segment = $derived.by(() => {
		const clipped = clipLineToSquare(line.A, line.B, EXTENT);
		if (!clipped) return null;
		const [P, Q] = clipped;
		return {
			mid: [(P.x + Q.x) / 2, (P.y + Q.y) / 2, 0.02],
			length: Math.hypot(Q.x - P.x, Q.y - P.y),
			angle: Math.atan2(Q.y - P.y, Q.x - P.x)
		};
	});

	// --- dragging -------------------------------------------------------------
	let dragging = $state(null); // "A" | "B" | null

	const clamp = (v) => Math.max(-EXTENT, Math.min(EXTENT, v));

	function startDrag(key, e) {
		e.stopPropagation();
		dragging = key;
		document.body.style.cursor = "grabbing";
	}

	function onMove(e) {
		if (!dragging) return;
		const other = dragging === "A" ? line.B : line.A;
		const x = clamp(e.point.x);
		const y = clamp(e.point.y);
		// keep the handles apart so the line stays well-defined
		if (Math.hypot(x - other.x, y - other.y) < MIN_HANDLE_DIST) return;
		line[dragging].x = x;
		line[dragging].y = y;
	}

	function endDrag() {
		if (!dragging) return;
		dragging = null;
		document.body.style.cursor = "";
	}

	function hover(on) {
		if (!dragging) document.body.style.cursor = on ? "grab" : "";
	}
</script>

<svelte:window onpointerup={endDrag} onpointercancel={endDrag} />

<!-- invisible catcher plane: receives pointer moves anywhere over the canvas while dragging -->
<T.Mesh position={[0, 0, -0.5]} onpointermove={onMove}>
	<T.PlaneGeometry args={[100, 100]} />
	<T.MeshBasicMaterial transparent opacity={0} depthWrite={false} />
</T.Mesh>

<!-- predicted-class shading -->
<T.Mesh geometry={posRegion} position={[0, 0, -0.03]}>
	<T.MeshBasicMaterial color={posColor} transparent opacity={0.14} depthWrite={false} />
</T.Mesh>
<T.Mesh geometry={negRegion} position={[0, 0, -0.03]}>
	<T.MeshBasicMaterial color={negColor} transparent opacity={0.14} depthWrite={false} />
</T.Mesh>

<!-- the line -->
{#if segment}
	<T.Mesh position={segment.mid} rotation.z={segment.angle}>
		<T.PlaneGeometry args={[segment.length, LINE_W]} />
		<T.MeshBasicMaterial color="#222222" />
	</T.Mesh>
{/if}

<!-- handles -->
{#each ["A", "B"] as key (key)}
	<T.Group position={[line[key].x, line[key].y, 0.1]}>
		<T.Mesh
			onpointerdown={(e) => startDrag(key, e)}
			onpointerenter={() => hover(true)}
			onpointerleave={() => hover(false)}
		>
			<T.CircleGeometry args={[HANDLE_R, 32]} />
			<T.MeshBasicMaterial color="#222222" />
		</T.Mesh>
		<T.Mesh position.z={0.01}>
			<T.CircleGeometry args={[HANDLE_R * 0.62, 32]} />
			<T.MeshBasicMaterial color={dragging === key ? "#ffd84d" : "#ffffff"} />
		</T.Mesh>
	</T.Group>
{/each}
