<script>
	// Single persistent scene for the explainer. Coordinate convention:
	// three.js x = feature x1, y = feature x2, z = lifted feature z = x1² + x2² (z is "up").
	// Orthographic camera: looking straight down it reads as a flat 2D plot (4.1); tilting
	// it reveals the 3D lift (4.2) without switching cameras.
	import { T, useThrelte } from "@threlte/core";
	import { interactivity, OrbitControls } from "@threlte/extras";
	import { untrack } from "svelte";
	import { gsap } from "gsap";
	import { EXTENT } from "$data/circles.js";
	import Axes from "./Axes.svelte";
	import Points from "./Points.svelte";
	import SplitLine from "./SplitLine.svelte";
	import Bowl from "./Bowl.svelte";
	import SeparatingPlane from "./SeparatingPlane.svelte";
	import { plane } from "$stores/explainer.svelte.js";

	let { step = 0 } = $props();

	interactivity();

	const { size, dom } = useThrelte();

	// --- step → scene state ---------------------------------------------------
	const is3D = $derived(step >= 2);
	const showLine = $derived(step === 1);
	const showBowl = $derived(step >= 3);
	// Rotation is introduced with the bowl ("Try it yourself: drag the plot…"), not before.
	const canRotate = $derived(step >= 3);
	const showPlane = $derived(step >= 4);

	// Animated values (tweened by GSAP, read reactively by child components).
	const anim = $state({ lift: 0, bowl: 0, plane: 0 });
	let animating = $state(false);

	// Fit the plot into the shorter canvas side; zoom out a bit in 3D for the tilted bowl.
	const zoom = $derived(
		(Math.min($size.width, $size.height) / (2 * (EXTENT + 0.9))) * (1 - 0.18 * anim.lift)
	);

	// --- camera ------------------------------------------------------------------
	// The camera sits on a sphere of radius R around a target on the z axis.
	// phi = angle from straight-down (0 = top view), theta = azimuth around z.
	const R = 12;
	const DURATION = 1.6;
	const VIEW_2D = { phi: 1e-4, theta: -Math.PI / 2, tz: 0 };
	const VIEW_3D = { phi: 1.1, theta: -Math.PI / 2 + 0.6, tz: 1.0 };

	let camera = $state();
	let controls = $state();
	let viewTween;

	function applyView(v) {
		controls.target.set(0, 0, v.tz);
		camera.position.set(
			R * Math.sin(v.phi) * Math.cos(v.theta),
			R * Math.sin(v.phi) * Math.sin(v.theta),
			v.tz + R * Math.cos(v.phi)
		);
		controls.update();
	}

	function currentView() {
		const t = controls.target;
		const d = camera.position.clone().sub(t);
		return { phi: Math.acos(d.z / d.length()), theta: Math.atan2(d.y, d.x), tz: t.z };
	}

	// Animate between the flat 2D view and the lifted 3D view whenever we cross that boundary.
	$effect(() => {
		const to3D = is3D;
		if (!camera || !controls) return;
		untrack(() => {
			const from = currentView();
			const to = { ...(to3D ? VIEW_3D : VIEW_2D) };
			// rotate the short way round if the user has orbited
			while (to.theta - from.theta > Math.PI) to.theta -= 2 * Math.PI;
			while (to.theta - from.theta < -Math.PI) to.theta += 2 * Math.PI;

			animating = true;
			viewTween?.kill();
			gsap.killTweensOf(anim, "lift");
			gsap.to(anim, { lift: to3D ? 1 : 0, duration: DURATION, ease: "power2.inOut" });
			viewTween = gsap.to(from, {
				...to,
				duration: DURATION,
				ease: "power2.inOut",
				onUpdate: () => applyView(from),
				onComplete: () => (animating = false)
			});
		});
	});

	$effect(() => {
		const on = showBowl;
		untrack(() => {
			gsap.killTweensOf(anim, "bowl");
			gsap.to(anim, { bowl: on ? 1 : 0, duration: 0.8, ease: "power1.out" });
		});
	});

	$effect(() => {
		const on = showPlane;
		untrack(() => {
			gsap.killTweensOf(anim, "plane");
			gsap.to(anim, { plane: on ? 1 : 0, duration: 0.8, ease: "power1.out" });
		});
	});

	// OrbitControls disables touch scrolling on the canvas when it is created. Only block
	// touch scrolling on steps where dragging on the canvas does something.
	$effect(() => {
		const interactive = showLine || canRotate;
		dom.style.touchAction = interactive ? "none" : "";
	});
</script>

<T.OrthographicCamera
	makeDefault
	bind:ref={camera}
	position={[0, -R * Math.sin(VIEW_2D.phi), R]}
	up={[0, 0, 1]}
	{zoom}
>
	<OrbitControls
		bind:ref={controls}
		enabled={canRotate && !animating}
		enableZoom={false}
		enablePan={false}
		minPolarAngle={0}
		maxPolarAngle={Math.PI / 2}
	/>
</T.OrthographicCamera>

<Axes lift={anim.lift} />
<Points lift={anim.lift} />
<Bowl opacity={anim.bowl} />
<SeparatingPlane t={plane.t} opacity={anim.plane} />

{#if showLine}
	<SplitLine />
{/if}
