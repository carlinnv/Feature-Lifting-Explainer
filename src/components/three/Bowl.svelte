<script>
	// Faint surface z = x1² + x2² (a paraboloid "bowl") to make the shape of the lifted
	// points easier to see. `opacity` (0 → 1) fades it in.
	import { T } from "@threlte/core";
	import { LatheGeometry, Vector2, DoubleSide } from "three";
	import { Z_SCALE } from "$utils/lift.js";

	let { opacity = 0 } = $props();

	const MAX_R = 2.5;
	const profile = [];
	for (let i = 0; i <= 24; i++) {
		const r = (MAX_R * i) / 24;
		profile.push(new Vector2(r, Z_SCALE * r * r));
	}
	// Lathe revolves around local y; rotating by +90° about x turns that into the z axis.
	const geometry = new LatheGeometry(profile, 48);
</script>

<T.Group rotation.x={Math.PI / 2} visible={opacity > 0.001}>
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
