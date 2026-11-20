<script>
	// Section 4.4, right-hand view: created when the user clicks "Collapse into 2D". It starts
	// as a clone of the main 3D view (same camera angle, even if the user rotated it), then
	// collapses to 2D. Sequence (runs once when mounted, after the split slide finishes):
	//   1. the dashed plane/bowl ring "lights up"
	//   2. points drop to the floor, the bowl and plane fade, the ring flattens with the points,
	//      and the camera tilts to look straight down
	//   3. predicted-class shading fades in around the now-flat dashed circle
	// After that it stays a 2D view that follows the plane height slider.
	//
	// `contours` (0 → 1, the "Confused…?" step): faint rings at every whole-number z across the
	// whole plot, to show a cut at one z value must follow one ring, and every ring is a circle.
	// Only shown once the collapse has finished. Hovering near a ring emphasises it and shows
	// its z. `flashKey` (a counter): each increment flashes all rings dark, then fades them back.
	import { T, useThrelte } from "@threlte/core";
	import { HTML } from "@threlte/extras";
	import { Tween } from "svelte/motion";
	import { untrack } from "svelte";
	import { gsap } from "gsap";
	import { Vector3 } from "three";
	import { EXTENT } from "$data/circles.js";
	import { plane, mainView } from "$stores/explainer.svelte.js";
	import { planeBowlCircle } from "$utils/lift.js";
	import { VIEW_2D, viewToPosition } from "$utils/camera.js";
	import Axes from "./Axes.svelte";
	import Points from "./Points.svelte";
	import Bowl from "./Bowl.svelte";
	import SeparatingPlane from "./SeparatingPlane.svelte";
	import Regions2D from "./Regions2D.svelte";
	import FeatureRegions2D from "./FeatureRegions2D.svelte";

	let { contours = 0, flashKey = 0 } = $props();

	const { size, invalidate, dom, camera: cameraStore } = useThrelte();

	const anim = $state({ lift: 1, bowl: 1, plane: 1, glow: 0, region: 0, flash: 0 });

	// Rings fade in/out; never before the collapse is done (anim.region reaches 1 at the end).
	const ringFade = new Tween(0, { duration: 700 });
	$effect(() => {
		ringFade.target = contours;
	});
	const rings = $derived(ringFade.current * anim.region);

	// Rings at every whole-number z out to the plot's corners (z = 2·EXTENT² ≈ 20.5 there),
	// so they fill the whole square; the outermost are clipped at its edges.
	const RING_MAX = Math.floor(2 * EXTENT * EXTENT);

	// Flash: each new flashKey briefly emphasises every ring, then fades back (~1.2s).
	$effect(() => {
		if (!flashKey) return;
		untrack(() => {
			gsap.killTweensOf(anim, "flash");
			anim.flash = 1;
			gsap.to(anim, { flash: 0, duration: 0.9, delay: 0.3, ease: "power1.in" });
		});
	});

	// Hover a ring to see its z: unproject the pointer onto the flat plot, then pick the ring
	// (whole-number z) whose circle passes within HOVER_PX of it.
	const HOVER_PX = 7;
	let hover = $state(null); // { k, x, y } or null
	const v = new Vector3();
	function pick(e) {
		if (rings < 0.5) return (hover = null);
		const rect = dom.getBoundingClientRect();
		v.set(
			((e.clientX - rect.left) / rect.width) * 2 - 1,
			-((e.clientY - rect.top) / rect.height) * 2 + 1,
			0
		).unproject($cameraStore);
		const r = Math.hypot(v.x, v.y);
		const k = Math.round(r * r);
		const inPlot = Math.abs(v.x) <= EXTENT && Math.abs(v.y) <= EXTENT;
		const distPx = Math.abs(r - Math.sqrt(k)) * zoom;
		hover = inPlot && k >= 1 && k <= RING_MAX && distPx <= HOVER_PX ? { k, x: v.x, y: v.y } : null;
	}
	function clear() {
		hover = null;
	}
	$effect(() => {
		dom.addEventListener("pointermove", pick);
		dom.addEventListener("pointerdown", pick);
		dom.addEventListener("pointerleave", clear);
		return () => {
			dom.removeEventListener("pointermove", pick);
			dom.removeEventListener("pointerdown", pick);
			dom.removeEventListener("pointerleave", clear);
		};
	});
	$effect(() => {
		if (rings < 0.5) hover = null;
	});

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
<!-- rings only: no side shading (Regions2D does that) and no boundary (the dashed ring does) -->
<FeatureRegions2D
	featureIndex={0}
	regionOpacity={0}
	showLine={false}
	contours={rings}
	ringMax={RING_MAX}
	hoverRing={hover?.k ?? 0}
	flash={anim.flash}
/>
{#if hover}
	<HTML position={[hover.x, hover.y, 0.4]} pointerEvents="none" zIndexRange={[100, 0]}>
		<span class="ring-tip"><i>z</i> = {hover.k}</span>
	</HTML>
{/if}
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

<style>
	/* tooltip just above-right of the pointer */
	.ring-tip {
		display: block;
		transform: translate(10px, calc(-100% - 8px));
		padding: 0.15rem 0.5rem;
		font-family: var(--font-sans);
		font-size: var(--14px, 14px);
		white-space: nowrap;
		color: white;
		background: #222;
		border-radius: 0.3rem;
	}

	.ring-tip i {
		font-family: var(--font-serif);
	}
</style>
