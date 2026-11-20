<script>
	// The dataset points. Spheres (not flat circles) so the same meshes can be
	// lifted along z in section 4.2.
	import { T } from "@threlte/core";
	import { SphereGeometry, MeshBasicMaterial } from "three";
	import { circles } from "$data/circles.js";
	import { COLORS } from "$stores/explainer.svelte.js";

	const geometry = new SphereGeometry(0.075, 16, 12);
	const materials = {
		blue: new MeshBasicMaterial({ color: COLORS.blue }),
		red: new MeshBasicMaterial({ color: COLORS.red })
	};
</script>

{#each circles as p, i (i)}
	<T.Mesh position={[p.x1, p.x2, 0.05]} {geometry} material={materials[p.label]} />
{/each}
