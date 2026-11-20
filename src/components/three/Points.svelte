<script>
	// The dataset points. Spheres (not flat circles) so they read correctly in 3D.
	// `lift` (0 → 1) raises each point from the floor to its display height.
	// Defaults to the circles dataset lifted by z = x1² + x2²; section 4.5 passes its own
	// `points` and `heights` (display units, one per point; may be negative).
	import { T, useThrelte } from "@threlte/core";
	import { untrack } from "svelte";
	import { SphereGeometry, MeshBasicMaterial, BufferGeometry, BufferAttribute } from "three";
	import { circles } from "$data/circles.js";
	import { COLORS } from "$stores/explainer.svelte.js";
	import { liftFeature, Z_SCALE } from "$utils/lift.js";

	let { lift = 0, points = circles, heights = null } = $props();

	const BASE_Z = 0.05;
	const geometry = new SphereGeometry(0.075, 16, 12);
	const materials = {
		blue: new MeshBasicMaterial({ color: COLORS.blue }),
		red: new MeshBasicMaterial({ color: COLORS.red })
	};

	const hs = $derived(heights ?? points.map((p) => Z_SCALE * liftFeature(p.x1, p.x2)));

	// Vertical "stems" from the floor to each point, to show how far each one was lifted.
	const stems = new BufferGeometry();
	stems.setAttribute(
		"position",
		new BufferAttribute(new Float32Array(untrack(() => points.length) * 6), 3)
	);
	const { invalidate } = useThrelte();

	$effect(() => {
		const pos = stems.attributes.position;
		points.forEach((p, i) => {
			pos.setXYZ(2 * i, p.x1, p.x2, 0);
			pos.setXYZ(2 * i + 1, p.x1, p.x2, BASE_Z + lift * hs[i]);
		});
		pos.needsUpdate = true;
		stems.computeBoundingSphere();
		invalidate();
	});
</script>

{#each points as p, i (i)}
	<T.Mesh
		position={[p.x1, p.x2, BASE_Z + lift * hs[i]]}
		{geometry}
		material={materials[p.label]}
	/>
{/each}

<T.LineSegments geometry={stems} visible={lift > 0.001}>
	<T.LineBasicMaterial color="#9a9a9a" transparent opacity={0.6 * lift} />
</T.LineSegments>
