// Simple throttle function to limit the frequency of function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    func(...args);
  };
}

// Check if WebRTC is supported by the browser
export function isWebRTCSupported(): boolean {
  return (
    'RTCPeerConnection' in window &&
    'getUserMedia' in navigator.mediaDevices
  );
}

// Check if the device has a camera
export async function hasCamera(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error checking for camera:', error);
    return false;
  }
}

// Check if the device has a microphone
export async function hasMicrophone(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'audioinput');
  } catch (error) {
    console.error('Error checking for microphone:', error);
    return false;
  }
}

// Get available video devices
export async function getVideoDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error getting video devices:', error);
    return [];
  }
}

// Check if device orientation is supported
export function isOrientationSupported(): boolean {
  return 'DeviceOrientationEvent' in window;
}

// Check if device motion is supported
export function isMotionSupported(): boolean {
  return 'DeviceMotionEvent' in window;
}

// Check if screen sharing is supported
export function isScreenSharingSupported(): boolean {
  return (
    navigator.mediaDevices && 
    'getDisplayMedia' in navigator.mediaDevices
  );
}

// Get user-friendly name for a device
export function getDeviceName(): string {
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  
  let deviceName = 'Unknown Device';
  
  // Check for mobile devices
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    deviceName = 'iOS Device';
    if (/iPhone/.test(userAgent)) deviceName = 'iPhone';
    if (/iPad/.test(userAgent)) deviceName = 'iPad';
    if (/iPod/.test(userAgent)) deviceName = 'iPod';
  } else if (/Android/.test(userAgent)) {
    deviceName = 'Android Device';
    const match = userAgent.match(/Android\s([0-9.]+)/);
    if (match) deviceName = `Android ${match[1]}`;
  } else if (/Windows/.test(platform)) {
    deviceName = 'Windows Device';
  } else if (/Mac/.test(platform)) {
    deviceName = 'Mac Device';
  } else if (/Linux/.test(platform)) {
    deviceName = 'Linux Device';
  }
  
  return deviceName;
}

// Generate a simple unique ID
export function generateSimpleId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Stop all tracks in a media stream
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
}
