<script>
	// Section 4.2 only: hovering (or tapping) near a point shows its z = x1² + x2² value,
	// to make clear z is just a number computed for each point. Works before and after the
	// lift; the tooltip follows the point up.
	//
	// The dots are small, so instead of raycasting the spheres we project every point to the
	// screen and pick the nearest one within PICK_PX of the pointer.
	import { useThrelte } from "@threlte/core";
	import { HTML } from "@threlte/extras";
	import { Vector3 } from "three";
	import { circles } from "$data/circles.js";
	import { liftFeature, Z_SCALE } from "$utils/lift.js";

	let { lift = 0 } = $props();

	const PICK_PX = 14;
	const BASE_Z = 0.05; // matches Points.svelte

	const { camera, dom } = useThrelte();
	const zs = circles.map((p) => liftFeature(p.x1, p.x2));
	const v = new Vector3();

	let hovered = $state(null);

	function pick(e) {
		const rect = dom.getBoundingClientRect();
		const px = e.clientX - rect.left;
		const py = e.clientY - rect.top;
		let best = null;
		let bestD = PICK_PX;
		circles.forEach((p, i) => {
			v.set(p.x1, p.x2, BASE_Z + lift * Z_SCALE * zs[i]).project($camera);
			const sx = ((v.x + 1) / 2) * rect.width;
			const sy = ((1 - v.y) / 2) * rect.height;
			const d = Math.hypot(sx - px, sy - py);
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		});
		hovered = best;
	}

	function clear() {
		hovered = null;
	}

	$effect(() => {
		dom.addEventListener("pointermove", pick);
		dom.addEventListener("pointerdown", pick); // taps on touch screens
		dom.addEventListener("pointerleave", clear);
		return () => {
			dom.removeEventListener("pointermove", pick);
			dom.removeEventListener("pointerdown", pick);
			dom.removeEventListener("pointerleave", clear);
		};
	});

	const p = $derived(hovered === null ? null : circles[hovered]);
</script>

{#if p}
	<HTML
		position={[p.x1, p.x2, BASE_Z + lift * Z_SCALE * zs[hovered]]}
		center
		pointerEvents="none"
		zIndexRange={[100, 0]}
	>
		<div class="hover">
			<span class="ring"></span>
			<span class="tip"><i>z</i> = {zs[hovered].toFixed(2)}</span>
		</div>
	</HTML>
{/if}

<style>
	.hover {
		position: relative;
		width: 0;
		height: 0;
	}

	.ring {
		position: absolute;
		left: -11px;
		top: -11px;
		width: 22px;
		height: 22px;
		border: 2px solid #222;
		border-radius: 50%;
	}

	.tip {
		position: absolute;
		left: 50%;
		bottom: 16px;
		transform: translateX(-50%);
		padding: 0.15rem 0.5rem;
		font-family: var(--font-sans);
		font-size: var(--14px, 14px);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		color: white;
		background: #222;
		border-radius: 0.3rem;
	}

	.tip i {
		font-family: var(--font-serif);
	}
</style>
