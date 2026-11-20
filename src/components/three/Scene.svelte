<script>
	// Placeholder scene to verify the Threlte setup. Top-down orthographic camera
	// so the x_1/x_2 plane reads as a flat 2D plot; z (the lifted feature) points at the viewer.
	import { T } from "@threlte/core";
	import { Grid } from "@threlte/extras";
</script>

<T.OrthographicCamera makeDefault position={[0, 0, 10]} zoom={40} up={[0, 1, 0]} />

<Grid plane="xy" cellSize={1} sectionSize={5} gridSize={[10, 10]} />

<T.Mesh position={[0, 0, 0]}>
	<T.SphereGeometry args={[0.15, 16, 16]} />
	<T.MeshBasicMaterial color="steelblue" />
</T.Mesh>
