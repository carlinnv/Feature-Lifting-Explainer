<script>
	// Section 4.5, left view: the XOR points lifted by the user's chosen feature, the
	// feature's surface (bowl / valley / saddle), and the horizontal plane z = t. Rotatable.
	// Only shown once the user has solved the challenge (see Index.svelte), as the explanation.
	// Switching features animates each point from its current height to its new one.
	import { T, useThrelte } from "@threlte/core";
	import { OrbitControls } from "@threlte/extras";
	import { untrack } from "svelte";
	import { gsap } from "gsap";
	import { EXTENT } from "$data/circles.js";
	import { xor } from "$data/xor.js";
	import { challenge } from "$stores/explainer.svelte.js";
	import { featureById, featureRange } from "$utils/features.js";
	import { VIEW_3D, viewToPosition } from "$utils/camera.js";
	import Axes from "./Axes.svelte";
	import Points from "./Points.svelte";
	import SeparatingPlane from "./SeparatingPlane.svelte";
	import FeatureSurface from "./FeatureSurface.svelte";

	const { size } = useThrelte();

	// Tallest |z| among the points is drawn at this display height, whatever the feature.
	const DISPLAY_MAX = 2.6;
	const MORPH_S = 0.9;
	const VIEW = { ...VIEW_3D, tz: 0.4 };

	const feature = $derived(featureById(challenge.featureId));
	const zScale = $derived.by(() => {
		const { min, max } = featureRange(xor, feature.fn);
		return DISPLAY_MAX / Math.max(Math.abs(min), Math.abs(max));
	});
	const targetHeights = $derived(xor.map((p) => zScale * feature.fn(p.x1, p.x2)));

	// Displayed heights morph toward the target when the feature changes.
	let heights = $state(untrack(() => targetHeights.slice()));
	let morph;
	$effect(() => {
		const to = targetHeights;
		untrack(() => {
			const from = heights.slice();
			const k = { v: 0 };
			morph?.kill();
			morph = gsap.to(k, {
				v: 1,
				duration: MORPH_S,
				ease: "power2.inOut",
				onUpdate: () => (heights = from.map((h, i) => h + (to[i] - h) * k.v))
			});
		});
		return () => morph?.kill();
	});

	const zoom = $derived((Math.min($size.width, $size.height) / (2 * (EXTENT + 0.9))) * 0.82);
</script>

<T.OrthographicCamera makeDefault position={viewToPosition(VIEW)} up={[0, 0, 1]} {zoom}>
	<OrbitControls
		target={[0, 0, VIEW.tz]}
		enableZoom={false}
		enablePan={false}
		minPolarAngle={0}
		maxPolarAngle={Math.PI / 2}
	/>
</T.OrthographicCamera>

<Axes lift={1} zLabel={`<i>z</i> = ${feature.html}`} />
<Points points={xor} {heights} lift={1} />
<FeatureSurface fn={feature.fn} {zScale} />
<SeparatingPlane t={challenge.t} {zScale} planeOpacity={1} ringOpacity={0} />
