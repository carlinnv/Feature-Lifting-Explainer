<script>
	// Section 4.4, right-hand view: created when the user clicks "Collapse into 2D". It starts
	// as a clone of the main 3D view (same camera angle, even if the user rotated it), then
	// collapses to 2D. Sequence (runs once when mounted, after the split slide finishes):
	//   1. the dashed plane/bowl ring "lights up"
	//   2. points drop to the floor, the bowl and plane fade, the ring flattens with the points,
	//      and the camera tilts to look straight down
	//   3. predicted-class shading fades in around the now-flat dashed circle
	// After that it stays a 2D view that follows the plane height slider.
	import { T, useThrelte } from "@threlte/core";
	import { untrack } from "svelte";
	import { gsap } from "gsap";
	import { EXTENT } from "$data/circles.js";
	import { plane, mainView } from "$stores/explainer.svelte.js";
	import { planeBowlCircle } from "$utils/lift.js";
	import { VIEW_2D, viewToPosition } from "$utils/camera.js";
	import Axes from "./Axes.svelte";
	import Points from "./Points.svelte";
	import Bowl from "./Bowl.svelte";
	import SeparatingPlane from "./SeparatingPlane.svelte";
	import Regions2D from "./Regions2D.svelte";

	const { size, invalidate } = useThrelte();

	const anim = $state({ lift: 1, bowl: 1, plane: 1, glow: 0, region: 0 });

	// Same framing rule as the main scene, so the two views match before the collapse.
	const zoom = $derived(
		(Math.min($size.width, $size.height) / (2 * (EXTENT + 0.9))) * (1 - 0.18 * anim.lift)
	);

	const circle = $derived(planeBowlCircle(plane.t, plane.tilt));

	let camera = $state();
	// Clone the main view's camera angle at creation time.
	const view = { ...mainView };

	function applyView() {
		camera.position.set(...viewToPosition(view));
		camera.lookAt(0, 0, view.tz);
		invalidate();
	}

	$effect(() => {
		if (!camera) return;
		let tl;
		untrack(() => {
			applyView();
			// End on the standard 2D orientation (x1 right, x2 up), rotating the short way round.
			const to = { ...VIEW_2D };
			while (to.theta - view.theta > Math.PI) to.theta -= 2 * Math.PI;
			while (to.theta - view.theta < -Math.PI) to.theta += 2 * Math.PI;
			const ease = "power2.inOut";
			tl = gsap
				.timeline({ delay: 0.8 })
				.to(anim, { glow: 1, duration: 0.5, ease: "power1.out" })
				.to(anim, { lift: 0, bowl: 0, plane: 0, duration: 1.6, ease }, "+=0.3")
				.to(view, { ...to, duration: 1.6, ease, onUpdate: applyView }, "<")
				.to(anim, { region: 1, duration: 0.6, ease: "power1.out" });
		});
		return () => tl?.kill();
	});
</script>

<T.OrthographicCamera makeDefault bind:ref={camera} up={[0, 0, 1]} {zoom} />

<Regions2D cx={circle.cx} cy={circle.cy} r={circle.r} opacity={anim.region} />
<Axes lift={anim.lift} />
<Points lift={anim.lift} />
<Bowl opacity={anim.bowl} />
<SeparatingPlane
	t={plane.t}
	tilt={plane.tilt}
	planeOpacity={anim.plane}
	ringOpacity={1}
	ringLift={anim.lift}
	glow={anim.glow}
/>
