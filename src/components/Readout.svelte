<script>
	// Accuracy readout shared by the "Try it yourself" steps (4.1 line, 4.3 plane).
	let { correct, total } = $props();

	const pct = $derived(Math.round((correct / total) * 100));
</script>

<div class="readout" class:perfect={correct === total} aria-live="polite">
	<span class="readout-label">Accuracy</span>
	<span class="readout-value">{pct}%</span>
	<div class="bar"><div class="bar-fill" style:width="{pct}%"></div></div>
	<span class="readout-note">
		{#if correct === total}
			All {total} points are on the correct side.
		{:else}
			{correct} of {total} points on the correct side
		{/if}
	</span>
</div>

<style>
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
		transition: width calc(var(--1s) * 0.15);
	}

	.perfect .bar-fill {
		background: #228833;
	}

	.readout-note {
		grid-column: 1 / -1;
		font-size: var(--14px, 14px);
		color: var(--color-fg-light);
	}

	.perfect .readout-note {
		color: #228833;
		font-weight: 700;
	}
</style>
