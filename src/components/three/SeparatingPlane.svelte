<script>
	// Section 4.3: a horizontal plane z = t, the linear classifier in the lifted 3D space.
	// Drawn as a thin slab with no outlines. The slab's side faces are more opaque than its
	// top/bottom, so it reads as a band when seen edge-on but stays see-through from above.
	// Also draws the ring where the plane cuts the bowl z = x1² + x2²: a circle of radius √t.
	// `t` is the unscaled plane height; `opacity` (0 → 1) fades everything in.
	import { T, useThrelte } from "@threlte/core";
	import { MeshLineGeometry, MeshLineMaterial } from "@threlte/extras";
	import { BoxGeometry, MeshBasicMaterial, DoubleSide, Vector3 } from "three";
	import { EXTENT } from "$data/circles.js";
	import { Z_SCALE } from "$utils/lift.js";

	let { t = 0, opacity = 0 } = $props();

	const THICKNESS = 0.05;
	const COLOR = "#d9a400";
	const RING_COLOR = "#b88a00"; // darker shade of the plane's gold
	const RING_WIDTH = 3; // line width in screen pixels (attenuate off)
	const DASH_CYCLE = 0.22; // world length of one dash + gap, so dashes keep their size as the ring grows
	const RING_SEGMENTS = 128;
	const FACE_OPACITY = 0.2;
	const SIDE_OPACITY = 0.6;
	const BOWL_MAX_R = 2.5; // matches Bowl.svelte; no ring once the plane is above the bowl's rim

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
		sideMat.opacity = SIDE_OPACITY * opacity;
		faceMat.opacity = FACE_OPACITY * opacity;
		invalidate();
	});

	const height = $derived(Z_SCALE * t);
	const ringR = $derived(Math.sqrt(Math.max(t, 0)));
	const showRing = $derived(ringR > 0.05 && ringR <= BOWL_MAX_R);
	// Closed circle (first point repeated at the end).
	const ringPoints = $derived(
		Array.from({ length: RING_SEGMENTS + 1 }, (_, i) => {
			const a = (i / RING_SEGMENTS) * 2 * Math.PI;
			return new Vector3(ringR * Math.cos(a), ringR * Math.sin(a), 0);
		})
	);
</script>

<T.Group position.z={height} visible={opacity > 0.001}>
	<T.Mesh {geometry} material={materials} />

	{#if showRing}
		<T.Mesh>
			<MeshLineGeometry points={ringPoints} />
			<MeshLineMaterial
				color={RING_COLOR}
				width={RING_WIDTH}
				attenuate={false}
				dashArray={DASH_CYCLE / (2 * Math.PI * ringR)}
				dashRatio={0.45}
				transparent
				opacity={opacity}
				depthWrite={false}
			/>
		</T.Mesh>
	{/if}
</T.Group>
