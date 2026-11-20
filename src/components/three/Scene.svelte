<script>
	// Single persistent scene for the explainer. Coordinate convention:
	// three.js x = feature x1, y = feature x2, z = lifted feature (used from section 4.2 on).
	// The top-down orthographic camera makes the x1/x2 plane read as a flat 2D plot.
	import { T, useThrelte } from "@threlte/core";
	import { interactivity } from "@threlte/extras";
	import { EXTENT } from "$data/circles.js";
	import Axes from "./Axes.svelte";
	import Points from "./Points.svelte";
	import SplitLine from "./SplitLine.svelte";

	let { step = 0 } = $props();

	interactivity();

	const { size } = useThrelte();
	// Fit the plot (plus room for axis labels) into the shorter canvas side.
	const zoom = $derived(Math.min($size.width, $size.height) / (2 * (EXTENT + 0.9)));
</script>

<T.OrthographicCamera makeDefault position={[0, 0, 10]} {zoom} />

<Axes />
<Points />

{#if step >= 1}
	<SplitLine />
{/if}
