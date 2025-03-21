// Convert degrees to a directional heading label
export function degreesToHeading(degrees: number | null): string {
  if (degrees === null) return 'Unknown';
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

// Format orientation values for display
export function formatOrientation(value: number | null): string {
  if (value === null) return '--';
  return value.toFixed(1);
}

// Calculate CSS transform style for roll visualization
export function getRollTransform(rollDegrees: number | null): string {
  if (rollDegrees === null) return 'rotate(0deg)';
  // Limit to reasonable range
  const clampedRoll = Math.max(-90, Math.min(90, rollDegrees));
  return `rotate(${clampedRoll}deg)`;
}

// Calculate CSS transform style for pitch visualization
export function getPitchTransform(pitchDegrees: number | null): string {
  if (pitchDegrees === null) return 'rotate(0deg)';
  // Limit to reasonable range
  const clampedPitch = Math.max(-90, Math.min(90, pitchDegrees));
  return `rotate(${clampedPitch}deg)`;
}

// Format battery percentage with appropriate color class
export function getBatteryColorClass(percentage: number | null): string {
  if (percentage === null) return 'text-gray-400';
  
  if (percentage <= 20) return 'text-danger';
  if (percentage <= 50) return 'text-warning';
  return 'text-accent';
}

// Format signal strength with appropriate text and color
export function getSignalQuality(strength: number | null): { text: string, colorClass: string } {
  if (strength === null) return { text: 'Unknown', colorClass: 'text-gray-400' };
  
  if (strength <= 25) return { text: 'Poor', colorClass: 'text-danger' };
  if (strength <= 50) return { text: 'Fair', colorClass: 'text-warning' };
  if (strength <= 75) return { text: 'Good', colorClass: 'text-primary' };
  return { text: 'Excellent', colorClass: 'text-accent' };
}

// Format seconds to MM:SS display
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Convert device orientation to drone orientation (may need adjustments based on drone model)
export function deviceToDroneOrientation(deviceOrientation: {
  alpha: number | null,
  beta: number | null,
  gamma: number | null
}): {
  pitch: number | null,
  roll: number | null,
  yaw: number | null
} {
  const { alpha, beta, gamma } = deviceOrientation;
  
  // Simple mapping - might need calibration for actual drone control
  return {
    pitch: beta, // Front-back tilt maps to drone pitch
    roll: gamma, // Left-right tilt maps to drone roll
    yaw: alpha   // Compass direction maps to drone yaw
  };
}
