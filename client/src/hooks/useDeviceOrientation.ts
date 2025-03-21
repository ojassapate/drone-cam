import { useEffect, useState } from 'react';

interface OrientationData {
  alpha: number | null; // z-axis (0-360 deg) - compass direction
  beta: number | null;  // x-axis (-180 to 180 deg) - front to back
  gamma: number | null; // y-axis (-90 to 90 deg) - left to right
  absolute: boolean;
  compassHeading: number | null;
}

interface UseDeviceOrientationOptions {
  onOrientationChange?: (data: OrientationData) => void;
}

export const useDeviceOrientation = (options: UseDeviceOrientationOptions = {}) => {
  const [orientation, setOrientation] = useState<OrientationData>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false,
    compassHeading: null
  });
  
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const { onOrientationChange } = options;

  // Request device orientation permission
  const requestPermission = async (): Promise<boolean> => {
    if (!DeviceOrientationEvent) return false;

    // Check if iOS requires permissions (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        setPermissionState(permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        setPermissionState('denied');
        return false;
      }
    } else {
      // No permission needed for non-iOS or older iOS
      setPermissionState('granted');
      return true;
    }
  };

  // Calculate compass heading from alpha, beta, gamma
  const calculateCompassHeading = (alpha: number, beta: number, gamma: number): number => {
    // Convert degrees to radians
    const alphaRad = alpha * (Math.PI / 180);
    const betaRad = beta * (Math.PI / 180);
    const gammaRad = gamma * (Math.PI / 180);
    
    // Calculate compass heading
    // This is a simplified calculation, it could be improved for more accuracy
    let heading = 0;
    
    if (Math.abs(beta) < 70) {
      // Device is relatively flat
      heading = alpha;
    } else {
      // Device is tilted
      const sinGamma = Math.sin(gammaRad);
      const cosGamma = Math.cos(gammaRad);
      const sinBeta = Math.sin(betaRad);
      const cosBeta = Math.cos(betaRad);
      
      const x = cosBeta * sinGamma;
      const y = sinBeta;
      
      heading = Math.atan2(y, x) * (180 / Math.PI);
      
      // Adjust heading to be in the range 0-360
      if (heading < 0) {
        heading += 360;
      }
    }
    
    return heading;
  };

  // Handle device orientation change event
  useEffect(() => {
    const handleOrientationChange = (event: DeviceOrientationEvent) => {
      try {
        // Handle case where orientation values are null
        if (event.alpha === null || event.beta === null || event.gamma === null) {
          return;
        }
        
        const compassHeading = calculateCompassHeading(
          event.alpha,
          event.beta,
          event.gamma
        );
        
        const newOrientation: OrientationData = {
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma,
          absolute: event.absolute,
          compassHeading
        };
        
        setOrientation(newOrientation);
        
        if (onOrientationChange) {
          onOrientationChange(newOrientation);
        }
      } catch (error) {
        console.error("Error processing device orientation event:", error);
      }
    };

    if (permissionState === 'granted') {
      try {
        window.addEventListener('deviceorientation', handleOrientationChange);
      } catch (error) {
        console.error("Error adding device orientation event listener:", error);
      }
    }

    return () => {
      try {
        window.removeEventListener('deviceorientation', handleOrientationChange);
      } catch (error) {
        console.error("Error removing device orientation event listener:", error);
      }
    };
  }, [permissionState, onOrientationChange]);

  return {
    orientation,
    requestPermission,
    permissionState
  };
};
