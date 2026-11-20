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
	import { plane, mainView, liftStep } from "$stores/explainer.svelte.js";
	import HoverZ from "./HoverZ.svelte";
	import { CAM_R, VIEW_2D, VIEW_3D, viewToPosition } from "$utils/camera.js";

	let { step = 0 } = $props();

	interactivity();

	const { size, dom } = useThrelte();

	// --- step → scene state ---------------------------------------------------
	// 4.2: the lift waits for the "Lift each point to height z" button (or happens
	// automatically once the reader scrolls on to step 3).
	const is3D = $derived(step >= 3 || (step === 2 && liftStep.lifted));
	// Hover a point to see its z — only in step 2, where z is introduced (user decision).
	const showHoverZ = $derived(step === 2);
	const showLine = $derived(step === 1);
	const showBowl = $derived(step >= 3);
	// Rotation is introduced with the bowl ("Try it yourself: drag the plot…"), not before.
	const canRotate = $derived(step >= 3);
	const showPlane = $derived(step >= 4);
	// 4.3 is always a horizontal plane; the tilt control only exists from 4.4 on.
	const tilt = $derived(step >= 5 ? plane.tilt : 0);

	// Animated values (tweened by GSAP, read reactively by child components).
	const anim = $state({ lift: 0, bowl: 0, plane: 0 });
	let animating = $state(false);

	// Fit the plot into the shorter canvas side; zoom out a bit in 3D for the tilted bowl.
	const zoom = $derived(
		(Math.min($size.width, $size.height) / (2 * (EXTENT + 0.9))) * (1 - 0.18 * anim.lift)
	);

	// --- camera ------------------------------------------------------------------
	// Framing (sphere radius, 2D/3D views) is shared with CollapseScene via $utils/camera.js.
	const R = CAM_R;
	const DURATION = 1.6;

	let camera = $state();
	let controls = $state();
	let viewTween;

	function applyView(v) {
		controls.target.set(0, 0, v.tz);
		camera.position.set(...viewToPosition(v));
		controls.update();
		syncMainView();
	}

	// Keep the shared copy of this camera's view current (used by the 4.4 clone).
	function syncMainView() {
		if (!camera || !controls) return;
		Object.assign(mainView, currentView());
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
		onchange={syncMainView}
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
<SeparatingPlane t={plane.t} {tilt} planeOpacity={anim.plane} ringOpacity={anim.plane} />

{#if showHoverZ}
	<HoverZ lift={anim.lift} />
{/if}

{#if showLine}
	<SplitLine />
{/if}
