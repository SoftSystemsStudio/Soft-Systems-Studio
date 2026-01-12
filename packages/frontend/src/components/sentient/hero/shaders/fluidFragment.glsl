/**
 * Fluid Particle Fragment Shader
 * Renders particles with soft circular gradients
 */

varying vec3 vColor;
varying float vAlpha;

void main() {
  // Calculate distance from center of point
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);

  // Soft circular gradient
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Discard fragments outside circle
  if (alpha < 0.01) discard;

  // Apply color with soft glow
  vec3 finalColor = vColor;

  // Add glow effect
  float glow = 1.0 - smoothstep(0.0, 0.5, dist);
  finalColor += vec3(0.2) * glow;

  gl_FragColor = vec4(finalColor, alpha * vAlpha);
}
