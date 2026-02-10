/**
 * useGeolocation Hook
 * Manages user geolocation with React hook pattern
 * Handles permission requests and location updates
 */

import { useState, useEffect } from "react";

interface Location {
  lat: number;
  lng: number;
}

interface GeolocationState {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation(
  watch: boolean = false,
  timeout: number = 10000,
): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser",
        isLoading: false,
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition): void => {
      setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        isLoading: false,
        error: null,
      });
    };

    const handleError = (error: GeolocationPositionError): void => {
      let errorMessage = "An error occurred while fetching location";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    };

    const options = {
      timeout,
      enableHighAccuracy: true,
    };

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options,
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options,
      );
    }
  }, [watch, timeout]);

  return state;
}
