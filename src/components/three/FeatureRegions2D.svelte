<script>
	// Section 4.5: predicted-class shading and decision boundary on the flat 2D plot for
	// "f(x1, x2) above / below t", for any feature in FEATURES. Done in a fragment shader,
	// since the boundaries aren't circles (x1·x2 = t is a hyperbola, x1² = t is two lines).
	// The boundary is drawn where f = t, at a constant on-screen width using fwidth().
	//
	// Two layers share one shader: the side shading sits under the points, and the gold
	// boundary sits over them (user request: the boundary overlays the points).
	import { T, useThrelte } from "@threlte/core";
	import { ShaderMaterial, PlaneGeometry, Color } from "three";
	import { EXTENT } from "$data/circles.js";
	import { COLORS } from "$stores/explainer.svelte.js";
	import { FEATURES } from "$utils/features.js";

	// opacity: both layers. regionOpacity: just the blue/red side shading (the boundary line
	// stays) — 4.5 keeps the sides hidden until the challenge is solved (user decision).
	// contours (0 → 1): faint level-set rings where the feature equals 1, 2, …, ringMax, drawn
	// under the points (used in 4.4's 2D view). Off by default.
	// showLine: draw the gold boundary f = t (4.4 turns it off; it has its own dashed ring).
	let {
		featureIndex = 0,
		t = 0,
		aboveLabel = "blue",
		opacity = 1,
		regionOpacity = 1,
		contours = 0,
		showLine = true,
		ringMax = 6, // highest ring drawn (z = 1 … ringMax)
		hoverRing = 0, // ring to emphasise (the one under the pointer); 0 = none
		flash = 0 // 0 → 1: emphasise every ring at once (the "faint rings" text highlight)
	} = $props();

	const RING_COLOR = "#7a7a7a";
	const RING_STRONG = "#2b2b2b"; // emphasised (hovered / flashing) ring colour

	const TINT = 0.14;
	const LINE_COLOR = "#b88a00"; // same gold as the 3D ring / plane
	const LINE_PX = 4.0;
	const SHADING_Z = -0.03; // under the points
	const LINE_Z = 0.3; // over the points (spheres reach z ≈ 0.125)

	// One branch per feature, generated from FEATURES so the shader can't drift from the JS.
	const featureGlsl = FEATURES.map(
		(f, i) => `${i === 0 ? "" : "else "}if (uFeature == ${i}) f = ${f.glsl};`
	).join("\n\t\t\t");

	// uMode 0 = side shading only, 1 = boundary line only.
	function makeMaterial(mode) {
		return new ShaderMaterial({
			transparent: true,
			depthWrite: false,
			uniforms: {
				uMode: { value: mode },
				uFeature: { value: 0 },
				uT: { value: 0 },
				uAbove: { value: new Color() },
				uBelow: { value: new Color() },
				uLine: { value: new Color(LINE_COLOR) },
				uTint: { value: TINT },
				uOpacity: { value: 1 },
				uRegion: { value: 1 },
				uLinePx: { value: LINE_PX },
				uContours: { value: 0 },
				uRingMax: { value: 6 },
				uRingColor: { value: new Color(RING_COLOR) },
				uRingStrong: { value: new Color(RING_STRONG) },
				uHoverRing: { value: 0 },
				uFlash: { value: 0 }
			},
			vertexShader: /* glsl */ `
				varying vec2 vPos;
				void main() {
					vPos = (modelMatrix * vec4(position, 1.0)).xy;
					gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: /* glsl */ `
				uniform int uMode;
				uniform int uFeature;
				uniform float uT;
				uniform vec3 uAbove;
				uniform vec3 uBelow;
				uniform vec3 uLine;
				uniform float uTint;
				uniform float uOpacity;
				uniform float uRegion;
				uniform float uLinePx;
				uniform float uContours;
				uniform float uRingMax;
				uniform vec3 uRingColor;
				uniform vec3 uRingStrong;
				uniform float uHoverRing;
				uniform float uFlash;
				varying vec2 vPos;
				void main() {
					float x = vPos.x;
					float y = vPos.y;
					float f = 0.0;
				${featureGlsl}
					float d = f - uT;
					if (uMode == 0) {
						vec3 region = d > 0.0 ? uAbove : uBelow;
						float a = uTint * uRegion;
						// level-set rings at f = 1, 2, …, uRingMax: ~1px wide normally, ~2px and darker
						// when emphasised (the hovered ring, or all rings during a flash)
						float k = floor(f + 0.5);
						float cpx = abs(f - k) / max(fwidth(f), 1e-6);
						float inRange = (k >= 1.0 && k <= uRingMax) ? 1.0 : 0.0;
						float hov = (uHoverRing > 0.5 && abs(k - uHoverRing) < 0.5) ? 1.0 : 0.0;
						float emph = max(uFlash, hov);
						float w = mix(0.5, 1.0, emph);
						float ring = inRange * (1.0 - smoothstep(w, w + 1.0, cpx)) * uContours;
						vec3 col = mix(region, mix(uRingColor, uRingStrong, emph), ring);
						gl_FragColor = vec4(col, max(a, ring * mix(0.35, 0.95, emph)) * uOpacity);
					} else {
						// distance to the boundary in pixels (first-order), for a constant-width line
						float px = abs(d) / max(fwidth(d), 1e-6);
						float line = 1.0 - smoothstep(uLinePx * 0.5, uLinePx * 0.5 + 1.0, px);
						if (line <= 0.0) discard;
						gl_FragColor = vec4(uLine, line * uOpacity);
					}
					// uniforms hold linear colours (three's colour management); convert for output
					#include <colorspace_fragment>
				}
			`
		});
	}

	const shadingMaterial = makeMaterial(0);
	const lineMaterial = makeMaterial(1);
	const geometry = new PlaneGeometry(2 * EXTENT, 2 * EXTENT);
	const { invalidate } = useThrelte();

	$effect(() => {
		for (const m of [shadingMaterial, lineMaterial]) {
			const u = m.uniforms;
			u.uFeature.value = featureIndex;
			u.uT.value = t;
			u.uAbove.value.set(COLORS[aboveLabel]);
			u.uBelow.value.set(COLORS[aboveLabel === "blue" ? "red" : "blue"]);
			u.uOpacity.value = opacity;
			u.uRegion.value = regionOpacity;
			u.uContours.value = contours;
			u.uRingMax.value = ringMax;
			u.uHoverRing.value = hoverRing;
			u.uFlash.value = flash;
		}
		invalidate();
	});
</script>

<T.Mesh {geometry} material={shadingMaterial} position.z={SHADING_Z} />
{#if showLine}
	<T.Mesh {geometry} material={lineMaterial} position.z={LINE_Z} />
{/if}
