<script>
	import { Canvas } from "@threlte/core";
	import { NoToneMapping } from "three";
	import Scrolly from "$components/helpers/Scrolly.svelte";
	import Scene from "$components/three/Scene.svelte";
	import { lineScore, COLORS } from "$stores/explainer.svelte.js";
	import { circles } from "$data/circles.js";

	let scrollIndex = $state(undefined);
	// Before any step is in view, show the first step's visual.
	const step = $derived(scrollIndex ?? 0);

	const score = $derived(lineScore.current);
	const pct = $derived(Math.round(score.accuracy * 100));
</script>

<header class="intro">
	<h1>Feature Lifting</h1>
	<p class="dek">How adding a new feature lets a straight-line classifier solve a curved problem.</p>
</header>

<svelte:boundary onerror={(e) => console.error(e)}>
	<section class="explainer">
		<div class="visual" class:interactive={step >= 1}>
			<Canvas toneMapping={NoToneMapping}>
				<Scene {step} />
			</Canvas>
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
						<div class="readout" aria-live="polite">
							<span class="readout-label">Accuracy</span>
							<span class="readout-value">{pct}%</span>
							<div class="bar"><div class="bar-fill" style:width="{pct}%"></div></div>
							<span class="readout-note"
								>{Math.round(score.accuracy * circles.length)} of {circles.length} points on the correct side</span
							>
						</div>
					</div>
				</div>
			</Scrolly>
		</div>
	</section>
</svelte:boundary>

<style>
	.intro {
		max-width: 40rem;
		margin: 0 auto;
		padding: 20vh 1.5rem 10vh;
		text-align: center;
	}

	.dek {
		color: var(--color-fg-light);
		font-size: var(--20px, 20px);
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

	/* let the canvas own touch gestures only while the line is draggable */
	.visual.interactive {
		touch-action: none;
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

	.readout {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: baseline;
		gap: 0.25rem 1rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
		font-family: var(--font-sans);
	}

	.readout-label {
		font-size: var(--14px, 14px);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-fg-light);
	}

	.readout-value {
		justify-self: end;
		font-size: var(--32px, 32px);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.bar {
		grid-column: 1 / -1;
		height: 0.5rem;
		background: var(--color-gray-200);
		border-radius: 999px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: var(--color-gray-800);
	}

	.readout-note {
		grid-column: 1 / -1;
		font-size: var(--14px, 14px);
		color: var(--color-fg-light);
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
