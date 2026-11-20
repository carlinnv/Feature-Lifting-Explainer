<script>
	import { Canvas } from "@threlte/core";
	import { NoToneMapping } from "three";
	import Scrolly from "$components/helpers/Scrolly.svelte";
	import Scene from "$components/three/Scene.svelte";
	import Readout from "$components/Readout.svelte";
	import {
		lineScore,
		planeScore,
		plane,
		PLANE_MIN,
		PLANE_MAX,
		collapse,
		challenge,
		challengeScore,
		selectFeature,
		COLORS
	} from "$stores/explainer.svelte.js";
	import CollapseScene from "$components/three/CollapseScene.svelte";
	import ChallengeScene3D from "$components/three/ChallengeScene3D.svelte";
	import ChallengeScene2D from "$components/three/ChallengeScene2D.svelte";
	import { FEATURES, featureById, featureRange } from "$utils/features.js";
	import { xor } from "$data/xor.js";
	import { fade } from "svelte/transition";
	import { circles } from "$data/circles.js";

	// Title arrow: glide down to the first section (jump instead if the reader prefers
	// reduced motion).
	let explainerEl = $state();
	function scrollToStart() {
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		explainerEl?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
	}

	let scrollIndex = $state(undefined);
	// Before any step is in view, show the first step's visual.
	const step = $derived(scrollIndex ?? 0);

	const lineCorrect = $derived(Math.round(lineScore.current.accuracy * circles.length));
	const planeCorrect = $derived(planeScore.current.correct);

	// Section 4.4: at step 5 the user clicks "Collapse into 2D", which splits the visual into the
	// 3D view (left) and a clone that collapses into 2D (right).
	const split = $derived(step >= 5 && step <= 6 && collapse.on);
	const showCollapseButton = $derived(step === 5 && !collapse.on);

	// Section 4.5: the XOR challenge replaces the visual with its own 3D (left) and 2D (right)
	// views. The main scene stays mounted underneath (hidden) so scrolling back is seamless.
	const inChallenge = $derived(step >= 7);
	const challengeCorrect = $derived(challengeScore.current.correct);
	const challengeFeature = $derived(featureById(challenge.featureId));
	const challengeRange = $derived(featureRange(xor, challengeFeature.fn));
	// The 3D view (and the side shading) appears only when the user presses Submit with every
	// point right (user decision); it then stays. A wrong submit shows a short message, which
	// clears as soon as the feature or plane height changes.
	let submitMessage = $state("");
	function submitChallenge() {
		if (challengeCorrect === xor.length) {
			challenge.revealed = true;
			submitMessage = "";
		} else {
			submitMessage = `Not quite: ${challengeCorrect} of ${xor.length} points are on the correct side. Try moving the plane or picking a different feature.`;
		}
	}
	$effect(() => {
		challenge.featureId;
		challenge.t;
		submitMessage = "";
	});

	// 2-decimal display without "-0.00" (the x1·x2 slider passes through tiny negatives near 0)
	const fmt = (v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

	// Only react once the step has settled: Scrolly can report a neighbouring step for a moment
	// while jumping (e.g. 4 → 6 → 5 on narrow screens), which must not trigger these.
	const SETTLE_MS = 300;
	$effect(() => {
		const s = step;
		const timer = setTimeout(() => {
			// Scrolling back above 4.4 resets it, so the button is offered again next time.
			if (s < 5) collapse.on = false;
			// Step 6's controls need the 2D view; if the user scrolled past without clicking, collapse now.
			else if (s >= 6) collapse.on = true;
			// Scrolling back above 4.5 hides its 3D view again, so it's re-earned next time.
			if (s < 7) challenge.revealed = false;
		}, SETTLE_MS);
		return () => clearTimeout(timer);
	});
</script>

<!-- Full-screen title, separate from the first section; the arrow glides down to it. -->
<header class="intro">
	<div class="intro-inner">
		<h1>Feature Lifting</h1>
		<p class="dek">
			How adding a new feature lets a straight-line classifier solve a curved problem.
		</p>
	</div>
	<button class="scroll-arrow" aria-label="Start the explainer" onclick={scrollToStart}>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M6 9l6 6 6-6" />
		</svg>
	</button>
</header>

<svelte:boundary onerror={(e) => console.error(e)}>
	<section class="explainer" bind:this={explainerEl}>
		<div class="visual" class:split class:challenge={inChallenge}>
			{#if inChallenge}
				<!-- 3D view only after the challenge is solved; the 2D view then slides to the right half -->
				{#if challenge.revealed}
					<div class="view view-left" transition:fade={{ duration: 600, delay: 300 }}>
						<Canvas toneMapping={NoToneMapping}>
							<ChallengeScene3D />
						</Canvas>
						<span class="view-label">3D: <i>x</i><sub>1</sub>, <i>x</i><sub>2</sub>, <i>z</i></span>
					</div>
				{/if}
				<div
					class="view view-right"
					class:half={challenge.revealed}
					transition:fade={{ duration: 400 }}
				>
					<Canvas toneMapping={NoToneMapping}>
						<ChallengeScene2D />
					</Canvas>
					<span class="view-label">2D: <i>x</i><sub>1</sub>, <i>x</i><sub>2</sub></span>
				</div>
			{/if}
			<div class="view view-main">
				<Canvas toneMapping={NoToneMapping}>
					<Scene {step} />
				</Canvas>
				{#if split}
					<span class="view-label" transition:fade>3D: <i>x</i><sub>1</sub>, <i>x</i><sub>2</sub>, <i>z</i></span>
				{/if}
				{#if showCollapseButton}
					<button class="collapse-btn" transition:fade onclick={() => (collapse.on = true)}>
						Collapse into 2D
					</button>
				{/if}
			</div>
			{#if split}
				<div class="view view-collapse" transition:fade={{ duration: 400 }}>
					<Canvas toneMapping={NoToneMapping}>
						<CollapseScene />
					</Canvas>
					<span class="view-label">2D: <i>x</i><sub>1</sub>, <i>x</i><sub>2</sub></span>
				</div>
			{/if}
		</div>

		<div class="steps">
			<Scrolly bind:value={scrollIndex}>
				<!-- 4.1, step 0: meet the data -->
				<div class="step" class:active={step === 0}>
					<div class="card">
						<p>
							Here is a dataset with two features, <i>x</i><sub>1</sub> and <i>x</i><sub>2</sub>.
							Each point belongs to one of two classes:
							<strong style:color={COLORS.blue}>blue</strong> or
							<strong style:color={COLORS.red}>red</strong>.
						</p>
						<p>
							The blue points cluster around the origin, and the red points form a ring around
							them.
						</p>
					</div>
				</div>

				<!-- 4.1, step 1: try to split with a line -->
				<div class="step" class:active={step === 1}>
					<div class="card">
						<p>
							A <strong>linear classifier</strong> splits the plane with a straight line: everything
							on one side is predicted one class, everything on the other side the other class.
						</p>
						<p>
							<strong>Try it yourself:</strong> drag the two white handles to move the line. Can you
							find a line that separates the red points from the blue ones?
						</p>
						<Readout correct={lineCorrect} total={circles.length} />
					</div>
				</div>

				<!-- 4.2, step 2: lift into 3D -->
				<div class="step" class:active={step === 2}>
					<div class="card">
						<p>A straight line can't do it. But what if we gave the classifier a third feature?</p>
						<p>
							We can build one from the two we already have:
							<i>z</i> = <i>x</i><sub>1</sub><sup>2</sup> + <i>x</i><sub>2</sub><sup>2</sup>, the
							squared distance from the origin. Points near the center get a small <i>z</i>; points
							far away get a large one.
						</p>
						<p class="note">
							<strong>Wait, are we allowed to do that?</strong> Yes. A feature is just a number we
							compute from a data point. The classifier doesn't care where its inputs come from, so
							<i>x</i><sub>1</sub><sup>2</sup> + <i>x</i><sub>2</sub><sup>2</sup> is as valid an input
							as <i>x</i><sub>1</sub> itself.
						</p>
						<p>Watch as each point is lifted to its height <i>z</i>.</p>
					</div>
				</div>

				<!-- 4.2, step 3: rotate and see the bowl -->
				<div class="step" class:active={step === 3}>
					<div class="card">
						<p><strong>Try it yourself:</strong> drag the plot to rotate it.</p>
						<p>
							Using <i>z</i> as the height makes the points form a bowl shape. Points close to the
							origin have a small <i>z</i>, so the
							<strong style:color={COLORS.blue}>blue</strong> points stay near the bottom. Points
							farther out have a larger <i>z</i>, so the
							<strong style:color={COLORS.red}>red</strong> points rise up the sides.
						</p>
					</div>
				</div>

				<!-- 4.3, step 4: slide a plane to separate the classes -->
				<div class="step" class:active={step === 4}>
					<div class="card">
						<p>
							In 3D, a linear classifier splits the space with a flat <strong>plane</strong> instead
							of a line. Here, points below the plane are predicted
							<strong style:color={COLORS.blue}>blue</strong> and points above it are predicted
							<strong style:color={COLORS.red}>red</strong>.
						</p>
						<p>
							<strong>Try it yourself:</strong> slide the plane up and down. Can you separate the
							classes now?
						</p>
						<label class="slider">
							<span class="slider-label">Plane height <i>z</i></span>
							<input
								type="range"
								min={PLANE_MIN}
								max={PLANE_MAX}
								step="0.05"
								bind:value={plane.t}
							/>
							<span class="slider-value">{plane.t.toFixed(2)}</span>
						</label>
						<Readout correct={planeCorrect} total={circles.length} />
					</div>
				</div>

				<!-- 4.4, step 5: collapse back into 2D -->
				<div class="step" class:active={step === 5}>
					<div class="card">
						<p>So what does the plane do to our original 2D data?</p>
						<p>
							Click <strong>Collapse into 2D</strong> above the graph. A copy of the 3D view will
							appear on the right and flatten back into 2D. The dashed ring where the plane cuts the
							bowl lights up, and as the points drop back to the floor, the ring comes down with
							them.
						</p>
						<p>
							It lands as a <strong>circle</strong>. Points inside the circle are predicted
							<strong style:color={COLORS.blue}>blue</strong>, and points outside are predicted
							<strong style:color={COLORS.red}>red</strong>.
						</p>
					</div>
				</div>

				<!-- 4.4, step 6: move the plane, watch the 2D boundary.
				     A "Plane tilt" slider (bind:value={plane.tilt}, range ±TILT_MAX) was removed for now
				     by user decision (possible confusion); the tilt support in the scenes is kept. -->
				<div class="step" class:active={step === 6}>
					<div class="card">
						<p>
							<strong>Try it yourself:</strong> move the plane up and down. Watch how the circle
							changes in the 2D view.
						</p>
						<label class="slider">
							<span class="slider-label">Plane height</span>
							<input
								type="range"
								min={PLANE_MIN}
								max={PLANE_MAX}
								step="0.05"
								bind:value={plane.t}
							/>
							<span class="slider-value">{plane.t.toFixed(2)}</span>
						</label>
						<Readout correct={planeCorrect} total={circles.length} />
					</div>
				</div>

				<!-- 4.5, step 7: XOR challenge — choose the constructed feature, then slide the plane -->
				<div class="step" class:active={step === 7}>
					<div class="card">
						<p><strong>Your turn.</strong> Here's a new dataset.</p>
						<p>
							This time the <strong style:color={COLORS.blue}>blue</strong> points sit in the
							top-right and bottom-left corners, and the
							<strong style:color={COLORS.red}>red</strong> points in the other two. Our old feature
							<i>z</i> = <i>x</i><sub>1</sub><sup>2</sup> + <i>x</i><sub>2</sub><sup>2</sup> is
							selected below. Can it separate them?
						</p>
						<p>
							<strong>Try it yourself:</strong> pick a feature to lift the points with, then slide the
							plane. Each side of the plane is predicted whichever class fits it better. Can you
							find a feature that gets every point right?
						</p>
						<p class="features-label">New feature <i>z</i> =</p>
						<div class="features" role="group" aria-label="Constructed feature z">
							{#each FEATURES as f (f.id)}
								<button
									class="feature-btn"
									aria-pressed={challenge.featureId === f.id}
									onclick={() => selectFeature(f.id)}
								>
									{@html f.html}
								</button>
							{/each}
						</div>
						<label class="slider">
							<span class="slider-label">Plane height</span>
							<input
								type="range"
								min={challengeRange.min}
								max={challengeRange.max}
								step={(challengeRange.max - challengeRange.min) / 200}
								bind:value={challenge.t}
							/>
							<span class="slider-value">{fmt(challenge.t)}</span>
						</label>
						<!-- Accuracy is hidden until a correct Submit (user decision), so the user commits
						     to an answer; a wrong Submit still reports the score in its message. -->
						{#if challenge.revealed}
							<Readout correct={challengeCorrect} total={xor.length} />
						{/if}
						{#if !challenge.revealed}
							<button class="submit-btn" onclick={submitChallenge}>Submit</button>
							{#if submitMessage}
								<p class="submit-msg" role="status" transition:fade={{ duration: 200 }}>
									{submitMessage}
								</p>
							{/if}
						{/if}
						{#if challenge.revealed}
							<p class="note reveal" transition:fade>
								<strong>Why does it work?</strong> The 3D view on the left shows the points lifted
								to their new height <i>z</i>. With <i>z</i> = <i>x</i><sub>1</sub> · <i>x</i><sub
									>2</sub
								>, the <strong style:color={COLORS.blue}>blue</strong> points rise above the plane and
								the <strong style:color={COLORS.red}>red</strong> points drop below it. Try the other
								features to see why they can't do the same.
							</p>
						{/if}
					</div>
				</div>
			</Scrolly>
		</div>
	</section>
</svelte:boundary>

<style>
	/* Title screen: fills the first viewport so it reads as its own page, with a rule
	   separating it from the first section. */
	.intro {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		min-height: 100svh;
		padding: 0 1.5rem;
		text-align: center;
		border-bottom: 1px solid var(--color-border);
	}

	.intro-inner {
		max-width: 40rem;
	}

	.intro h1 {
		margin: 0 0 1rem;
		font-size: clamp(2.5rem, 7vw, 4.5rem);
		line-height: 1.05;
	}

	.dek {
		margin: 0;
		color: var(--color-fg-light);
		font-size: var(--20px, 20px);
	}

	.scroll-arrow {
		position: absolute;
		bottom: 2.5rem;
		left: 50%;
		transform: translateX(-50%);
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		padding: 0;
		color: var(--color-fg);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 50%;
		cursor: pointer;
	}

	.scroll-arrow:hover,
	.scroll-arrow:focus-visible {
		border-color: var(--color-gray-800);
	}

	.scroll-arrow svg {
		width: 1.5rem;
		height: 1.5rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	@media (prefers-reduced-motion: no-preference) {
		.scroll-arrow {
			animation: arrow-bob 1.8s ease-in-out infinite;
		}
	}

	@keyframes arrow-bob {
		0%,
		100% {
			transform: translate(-50%, 0);
		}
		50% {
			transform: translate(-50%, 6px);
		}
	}

	.explainer {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.visual {
		position: sticky;
		top: 0;
		height: 100vh;
	}

	/* Section 4.4: the main view slides to the left half; the collapse view takes the right. */
	.view {
		position: absolute;
		top: 0;
		height: 100%;
		/* lets labels/buttons be placed relative to the plot via cqmin units */
		container-type: size;
	}

	.view-main {
		left: 0;
		width: 100%;
		transition: width calc(var(--1s) * 0.6) ease-in-out;
	}

	.split .view-main {
		width: 50%;
	}

	/* Section 4.5: challenge views on top; the main scene is hidden underneath. */
	.challenge .view-main {
		visibility: hidden;
	}

	.view-left {
		left: 0;
		width: 50%;
		z-index: var(--z-base);
		background: var(--color-bg);
	}

	/* 4.5's 2D view: full width until the challenge is solved, then the right half */
	.view-right {
		right: 0;
		width: 100%;
		z-index: var(--z-base);
		background: var(--color-bg);
		transition: width calc(var(--1s) * 0.6) ease-in-out;
	}

	.view-right.half {
		width: 50%;
		border-left: 1px solid var(--color-border);
	}

	.features {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.feature-btn {
		padding: 0.35rem 0.8rem;
		font-family: var(--font-serif);
		font-size: var(--16px, 16px);
		color: var(--color-fg);
		background: var(--color-bg);
		border: 1px solid var(--color-gray-400);
		border-radius: 999px;
		cursor: pointer;
	}

	.feature-btn:hover {
		border-color: var(--color-gray-800);
	}

	.feature-btn[aria-pressed="true"] {
		color: var(--color-white);
		background: var(--color-gray-900);
		border-color: var(--color-gray-900);
	}

	.features-label {
		margin: 1rem 0 0;
		font-family: var(--font-sans);
		font-size: var(--14px, 14px);
		color: var(--color-fg-light);
	}

	.view-collapse {
		right: 0;
		width: 50%;
		border-left: 1px solid var(--color-border);
	}

	/* The scene fits the plot into the view's shorter side (min(w, h) = 100cqmin), centred,
	   so 50% − 50cqmin is the top of the plot's framing box. Labels and the button sit just
	   above it instead of at the top of the whole panel. */
	.view-label,
	.collapse-btn {
		position: absolute;
		top: calc(50% - 50cqmin + 0.5rem);
		left: 50%;
		transform: translate(-50%, -100%);
	}

	.collapse-btn {
		/* the 3D view is zoomed out to 82% (Scene.svelte), so its framing box is smaller */
		top: calc(50% - 41cqmin);
		padding: 0.5rem 1rem;
		font-family: var(--font-sans);
		font-size: var(--16px, 16px);
		font-weight: 700;
		color: var(--color-white);
		background: var(--color-gray-900);
		border: none;
		border-radius: 999px;
		cursor: pointer;
		z-index: var(--z-top);
	}

	.collapse-btn:hover,
	.collapse-btn:focus-visible {
		background: var(--color-gray-700);
	}

	.view-label {
		padding: 0.2rem 0.6rem;
		font-family: var(--font-sans);
		font-size: var(--14px, 14px);
		color: var(--color-fg-light);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		white-space: nowrap;
		pointer-events: none;
	}

	.steps {
		padding: 0 1.5rem 50vh;
	}

	.step {
		min-height: 90vh;
		display: flex;
		align-items: center;
	}

	.card {
		max-width: 30rem;
		padding: 1.25rem 1.5rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		opacity: 0.35;
		transition: opacity calc(var(--1s) * 0.3);
	}

	.step.active .card {
		opacity: 1;
	}

	.note {
		padding: 0.75rem 1rem;
		background: var(--color-gray-50);
		border-left: 3px solid var(--color-gray-400);
		border-radius: var(--radius-sm);
		font-size: var(--16px, 16px);
	}

	.note.reveal {
		margin-top: 1rem;
	}

	.submit-btn {
		margin-top: 1rem;
		padding: 0.5rem 1.25rem;
		font-family: var(--font-sans);
		font-size: var(--16px, 16px);
		font-weight: 700;
		color: var(--color-white);
		background: var(--color-gray-900);
		border: none;
		border-radius: 999px;
		cursor: pointer;
	}

	.submit-btn:hover,
	.submit-btn:focus-visible {
		background: var(--color-gray-700);
	}

	.submit-msg {
		margin: 0.75rem 0 0;
		font-family: var(--font-sans);
		font-size: var(--14px, 14px);
		color: #b3261e;
	}

	.slider {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1rem;
		font-family: var(--font-sans);
		font-size: var(--14px, 14px);
	}

	.slider-label {
		color: var(--color-fg-light);
	}

	.slider input {
		width: 100%;
		accent-color: #d9a400;
	}

	.slider-value {
		min-width: 2.5rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	/* phones/narrow screens: visual pinned to the top half, text scrolls underneath */
	@media (max-width: 800px) {
		.explainer {
			grid-template-columns: 1fr;
		}

		.visual {
			height: 55vh;
			z-index: var(--z-top);
			background: var(--color-bg);
		}

		.step {
			min-height: 70vh;
			align-items: flex-end;
		}

		.card {
			opacity: 1;
		}
	}
</style>
