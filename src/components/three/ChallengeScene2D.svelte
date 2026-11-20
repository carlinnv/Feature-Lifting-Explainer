<script>
	// Section 4.5, right view: the XOR points on the flat 2D plot with the decision boundary
	// f(x1, x2) = t drawn in gold, and the blue/red predicted-class shading on either side.
	// The shading is always shown and updates live with the feature and plane height (user
	// decision; it was briefly hidden until the challenge was solved).
	import { T, useThrelte } from "@threlte/core";
	import { EXTENT } from "$data/circles.js";
	import { xor } from "$data/xor.js";
	import { challenge, challengeScore } from "$stores/explainer.svelte.js";
	import { FEATURES } from "$utils/features.js";
	import { VIEW_2D, viewToPosition } from "$utils/camera.js";
	import Axes from "./Axes.svelte";
	import Points from "./Points.svelte";
	import FeatureRegions2D from "./FeatureRegions2D.svelte";

	const { size } = useThrelte();
	const zoom = $derived(Math.min($size.width, $size.height) / (2 * (EXTENT + 0.9)));

	const featureIndex = $derived(FEATURES.findIndex((f) => f.id === challenge.featureId));
	const aboveLabel = $derived(challengeScore.current.aboveLabel);
</script>

<T.OrthographicCamera
	makeDefault
	position={viewToPosition(VIEW_2D)}
	up={[0, 0, 1]}
	{zoom}
	oncreate={(cam) => cam.lookAt(0, 0, 0)}
/>

<FeatureRegions2D {featureIndex} t={challenge.t} {aboveLabel} />
<Axes lift={0} />
<Points points={xor} lift={0} heights={xor.map(() => 0)} />
