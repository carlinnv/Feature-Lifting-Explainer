<script>
	// 2D axes for the x1/x2 plane: light grid, x1/x2 axes through the origin, plot border, labels.
	import { T } from "@threlte/core";
	import { HTML } from "@threlte/extras";
	import { EXTENT } from "$data/circles.js";

	// lift (0 → 1) grows the z axis out of the floor in section 4.2
	// zLabel (HTML) names the lifted feature; section 4.5 passes the user's chosen one.
	let {
		lift = 0,
		zLabel = "<i>z</i> = <i>x</i><sub>1</sub><sup>2</sup> + <i>x</i><sub>2</sub><sup>2</sup>"
	} = $props();

	const Z_AXIS_H = 3.4;
	const AXIS_W = 0.025;
	const GRID_W = 0.01;
	const span = 2 * EXTENT;

	// integer grid lines strictly inside the plot
	const ticks = [];
	for (let i = Math.ceil(-EXTENT); i <= Math.floor(EXTENT); i++) {
		if (i !== 0 && Math.abs(i) < EXTENT) ticks.push(i);
	}
</script>

<!-- grid -->
{#each ticks as t (t)}
	<T.Mesh position={[t, 0, -0.02]}>
		<T.PlaneGeometry args={[GRID_W, span]} />
		<T.MeshBasicMaterial color="#e2e2e2" />
	</T.Mesh>
	<T.Mesh position={[0, t, -0.02]}>
		<T.PlaneGeometry args={[span, GRID_W]} />
		<T.MeshBasicMaterial color="#e2e2e2" />
	</T.Mesh>
{/each}

<!-- axes through origin -->
<T.Mesh position={[0, 0, -0.01]}>
	<T.PlaneGeometry args={[span, AXIS_W]} />
	<T.MeshBasicMaterial color="#888888" />
</T.Mesh>
<T.Mesh position={[0, 0, -0.01]}>
	<T.PlaneGeometry args={[AXIS_W, span]} />
	<T.MeshBasicMaterial color="#888888" />
</T.Mesh>

<!-- border -->
{#each [-1, 1] as s (s)}
	<T.Mesh position={[0, s * EXTENT, -0.01]}>
		<T.PlaneGeometry args={[span + AXIS_W, AXIS_W]} />
		<T.MeshBasicMaterial color="#bbbbbb" />
	</T.Mesh>
	<T.Mesh position={[s * EXTENT, 0, -0.01]}>
		<T.PlaneGeometry args={[AXIS_W, span + AXIS_W]} />
		<T.MeshBasicMaterial color="#bbbbbb" />
	</T.Mesh>
{/each}

<!-- labels -->
<HTML position={[EXTENT + 0.35, 0, 0]} center pointerEvents="none">
	<span class="axis-label">x<sub>1</sub></span>
</HTML>
<HTML position={[0, EXTENT + 0.35, 0]} center pointerEvents="none">
	<span class="axis-label">x<sub>2</sub></span>
</HTML>

<!-- z axis (the constructed feature) -->
{#if lift > 0.001}
	<T.Mesh position={[0, 0, (Z_AXIS_H * lift) / 2]} scale.z={lift}>
		<T.BoxGeometry args={[AXIS_W * 1.5, AXIS_W * 1.5, Z_AXIS_H]} />
		<T.MeshBasicMaterial color="#888888" />
	</T.Mesh>
	<HTML position={[0, 0, Z_AXIS_H * lift + 0.3]} center pointerEvents="none">
		<span class="axis-label" style:opacity={lift}>{@html zLabel}</span>
	</HTML>
{/if}

<style>
	.axis-label {
		font-family: var(--font-serif);
		font-style: italic;
		font-size: var(--18px, 18px);
		color: #555;
		user-select: none;
		white-space: nowrap;
	}
</style>
