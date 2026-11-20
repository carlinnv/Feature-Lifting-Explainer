<script>
	import { Canvas } from "@threlte/core";
	import Scene from "$components/three/Scene.svelte";
</script>

<svelte:boundary onerror={(e) => console.error(e)}>
	<div class="canvas-wrap">
		<Canvas>
			<Scene />
		</Canvas>
	</div>
</svelte:boundary>

<style>
	.canvas-wrap {
		width: 100%;
		height: 100vh;
	}
</style>
