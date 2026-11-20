<script>
	// Sections 4.3–4.4: the plane z = t + tilt·x1, the linear classifier in the lifted 3D space,
	// plus the dashed ring where it cuts the bowl z = x1² + x2².
	//
	// The plane is a thin slab with no outlines. Its side faces are more opaque than its
	// top/bottom, so it reads as a band edge-on but stays see-through from above.
	//
	// The ring is drawn separately in world coordinates. For any t and tilt it is the circle
	// from planeBowlCircle(); each ring point sits on the bowl at height x1² + x2².
	//
	// Props:
	//   t, tilt        plane parameters (unscaled z)
	//   planeOpacity   0 → 1 fade for the slab
	//   ringOpacity    0 → 1 fade for the ring
	//   ringLift       1 = ring on the bowl in 3D, 0 = ring flattened onto the floor (4.4 collapse)
	//   glow           0 → 1 "light up": brighter colour and wider line
	import { T, useThrelte } from "@threlte/core";
	import { MeshLineGeometry, MeshLineMaterial } from "@threlte/extras";
	import { BoxGeometry, MeshBasicMaterial, DoubleSide, Vector3, Color } from "three";
	import { EXTENT } from "$data/circles.js";
	import { Z_SCALE, liftFeature, planeBowlCircle } from "$utils/lift.js";

	let {
		t = 0,
		tilt = 0,
		planeOpacity = 0,
		ringOpacity = 0,
		ringLift = 1,
		glow = 0
	} = $props();

	const THICKNESS = 0.05;
	const COLOR = "#d9a400";
	const RING_COLOR = "#b88a00"; // darker shade of the plane's gold
	const GLOW_COLOR = "#ff9f00"; // "lit up" ring
	const RING_WIDTH = 3; // line width in screen pixels (attenuate off)
	const GLOW_EXTRA_WIDTH = 2;
	const DASH_CYCLE = 0.22; // world length of one dash + gap, so dashes keep their size as the ring grows
	const RING_SEGMENTS = 128;
	const FLOOR_Z = 0.02;
	const FACE_OPACITY = 0.2;
	const SIDE_OPACITY = 0.6;

	// --- slab --------------------------------------------------------------------
	const geometry = new BoxGeometry(2 * EXTENT, 2 * EXTENT, THICKNESS);
	const makeMat = () =>
		new MeshBasicMaterial({ color: COLOR, transparent: true, side: DoubleSide, depthWrite: false });
	const sideMat = makeMat();
	const faceMat = makeMat();
	// BoxGeometry face order: +x, -x, +y, -y, +z (top), -z (bottom)
	const materials = [sideMat, sideMat, sideMat, sideMat, faceMat, faceMat];

	// Materials are mutated directly (not via props), so request a re-render ourselves.
	const { invalidate } = useThrelte();
	$effect(() => {
		sideMat.opacity = SIDE_OPACITY * planeOpacity;
		faceMat.opacity = FACE_OPACITY * planeOpacity;
		invalidate();
	});

	// Displayed slope along x1 is Z_SCALE·tilt. Rotating about the x2 (y) axis by −atan(slope)
	// tilts the slab; stretching it by 1/cos keeps its footprint at ±EXTENT in x1.
	const angle = $derived(Math.atan(Z_SCALE * tilt));

	// --- ring --------------------------------------------------------------------
	const circle = $derived(planeBowlCircle(t, tilt));
	const showRing = $derived(circle.r > 0.05 && ringOpacity > 0.001);

	// Closed circle (first point repeated at the end), each point on the bowl surface.
	const ringPoints = $derived(
		Array.from({ length: RING_SEGMENTS + 1 }, (_, i) => {
			const a = (i / RING_SEGMENTS) * 2 * Math.PI;
			const x = circle.cx + circle.r * Math.cos(a);
			const y = circle.cy + circle.r * Math.sin(a);
			return new Vector3(x, y, FLOOR_Z + ringLift * Z_SCALE * liftFeature(x, y));
		})
	);

	const ringColor = $derived(new Color(RING_COLOR).lerp(new Color(GLOW_COLOR), glow));
</script>

<T.Group position.z={Z_SCALE * t} rotation.y={-angle} visible={planeOpacity > 0.001}>
	<T.Mesh {geometry} material={materials} scale.x={1 / Math.cos(angle)} />
</T.Group>

{#if showRing}
	<T.Mesh>
		<MeshLineGeometry points={ringPoints} />
		<MeshLineMaterial
			color={ringColor}
			width={RING_WIDTH + GLOW_EXTRA_WIDTH * glow}
			attenuate={false}
			dashArray={DASH_CYCLE / (2 * Math.PI * circle.r)}
			dashRatio={0.45}
			transparent
			opacity={ringOpacity}
			depthWrite={false}
		/>
	</T.Mesh>
{/if}
