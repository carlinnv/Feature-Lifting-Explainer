// Shared camera framing for the Threlte scenes. The camera sits on a sphere of radius
// CAM_R around a target (0, 0, tz). phi = angle from straight down (0 = top view),
// theta = azimuth around the z axis. Camera "up" is +z.
export const CAM_R = 12;
export const VIEW_2D = { phi: 1e-4, theta: -Math.PI / 2, tz: 0 };
export const VIEW_3D = { phi: 1.1, theta: -Math.PI / 2 + 0.6, tz: 1.0 };

export function viewToPosition(v, R = CAM_R) {
	return [
		R * Math.sin(v.phi) * Math.cos(v.theta),
		R * Math.sin(v.phi) * Math.sin(v.theta),
		v.tz + R * Math.cos(v.phi)
	];
}
