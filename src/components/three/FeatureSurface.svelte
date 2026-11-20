<script>
	// Section 4.5: faint surface z = f(x1, x2) for the chosen feature, over the whole plot
	// (a bowl for x1² + x2², a valley for x1² or x2², a saddle for x1·x2). Same look as Bowl.svelte.
	// `fn` is the feature, `zScale` its display scale, `opacity` 0 → 1.
	import { T, useThrelte } from "@threlte/core";
	import { PlaneGeometry, DoubleSide } from "three";
	import { EXTENT } from "$data/circles.js";

	let { fn, zScale = 1, opacity = 1 } = $props();

	const SEGMENTS = 32;
	const Z_CLAMP = 3; // keep the plot corners (e.g. the saddle's) from shooting off-screen
	const geometry = new PlaneGeometry(2 * EXTENT, 2 * EXTENT, SEGMENTS, SEGMENTS);
	const { invalidate } = useThrelte();

	$effect(() => {
		const pos = geometry.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			const z = zScale * fn(pos.getX(i), pos.getY(i));
			pos.setZ(i, Math.max(-Z_CLAMP, Math.min(Z_CLAMP, z)));
		}
		pos.needsUpdate = true;
		geometry.computeBoundingSphere();
		invalidate();
	});
</script>

<T.Group visible={opacity > 0.001}>
	<T.Mesh {geometry}>
		<T.MeshBasicMaterial
			color="#8a8a8a"
			transparent
			opacity={0.1 * opacity}
			side={DoubleSide}
			depthWrite={false}
		/>
	</T.Mesh>
	<T.Mesh {geometry}>
		<T.MeshBasicMaterial
			color="#8a8a8a"
			wireframe
			transparent
			opacity={0.18 * opacity}
			depthWrite={false}
		/>
	</T.Mesh>
</T.Group>
