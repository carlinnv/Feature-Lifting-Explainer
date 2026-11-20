<script>
	// Section 4.4: predicted-class shading on the flat 2D plot for the circular boundary.
	// Inside the circle is predicted blue, outside is predicted red (same tint as 4.1's line).
	// The outside region is the plot square with a circular hole, so the two tints never overlap.
	import { T } from "@threlte/core";
	import { Shape, Path } from "three";
	import { EXTENT } from "$data/circles.js";
	import { COLORS } from "$stores/explainer.svelte.js";

	let { cx = 0, cy = 0, r = 1, opacity = 0 } = $props();

	const TINT = 0.14;

	const outside = $derived.by(() => {
		const s = new Shape();
		s.moveTo(-EXTENT, -EXTENT);
		s.lineTo(EXTENT, -EXTENT);
		s.lineTo(EXTENT, EXTENT);
		s.lineTo(-EXTENT, EXTENT);
		s.closePath();
		const hole = new Path();
		hole.absarc(cx, cy, r, 0, 2 * Math.PI, true);
		s.holes.push(hole);
		return s;
	});
</script>

{#if opacity > 0.001 && r > 0.05}
	<T.Mesh position.z={-0.03}>
		<T.ShapeGeometry args={[outside, 96]} />
		<T.MeshBasicMaterial color={COLORS.red} transparent opacity={TINT * opacity} depthWrite={false} />
	</T.Mesh>
	<T.Mesh position={[cx, cy, -0.03]}>
		<T.CircleGeometry args={[r, 96]} />
		<T.MeshBasicMaterial color={COLORS.blue} transparent opacity={TINT * opacity} depthWrite={false} />
	</T.Mesh>
{/if}
