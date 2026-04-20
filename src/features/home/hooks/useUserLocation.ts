import { useCallback, useEffect, useRef, useState } from "react";
import type {
  UserLocationCoordinates,
  UserLocationState,
  UserLocationStatus,
} from "@/features/home/types";

const GEO_TIMEOUT_MS = 10000;
const GEO_MAX_AGE_MS = 5 * 60 * 1000;

type UseUserLocationOptions = {
  autoRequest?: boolean;
};

const mapGeolocationError = (
  err: GeolocationPositionError,
): Pick<UserLocationState, "status" | "message" | "errorCode"> => {
  if (err.code === err.PERMISSION_DENIED) {
    return {
      status: "denied",
      message:
        "Location access is blocked. Enable it in your browser settings to see accurate distances.",
      errorCode: err.code,
    };
  }

  if (err.code === err.POSITION_UNAVAILABLE) {
    return {
      status: "unavailable",
      message: "Your location could not be determined right now.",
      errorCode: err.code,
    };
  }

  if (err.code === err.TIMEOUT) {
    return {
      status: "unavailable",
      message: "Location lookup timed out. Try again.",
      errorCode: err.code,
    };
  }

  return {
    status: "error",
    message: err.message || "Unexpected geolocation error.",
    errorCode: err.code,
  };
};

const permissionStateToStatus = (
  permissionState: PermissionState,
): UserLocationStatus => {
  if (permissionState === "granted") return "loading";
  if (permissionState === "denied") return "denied";
  return "idle";
};

export const useUserLocation = (
  options: UseUserLocationOptions = {},
): UserLocationState => {
  const { autoRequest = true } = options;
  const geolocationSupported =
    typeof window !== "undefined" && "geolocation" in navigator;

  const [status, setStatus] = useState<UserLocationStatus>(
    geolocationSupported ? "idle" : "unsupported",
  );
  const [coordinates, setCoordinates] =
    useState<UserLocationCoordinates | null>(null);
  const [message, setMessage] = useState<string | null>(
    geolocationSupported ? null : "This browser does not support geolocation.",
  );
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const requestInFlight = useRef(false);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setMessage("This browser does not support geolocation.");
      setErrorCode(null);
      return;
    }

    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setStatus("loading");
    setMessage(null);
    setErrorCode(null);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoordinates: UserLocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
          };
          setCoordinates(nextCoordinates);
          setStatus("granted");
          setMessage(null);
          setErrorCode(null);
          requestInFlight.current = false;
        },
        (err) => {
          const mapped = mapGeolocationError(err);
          setStatus(mapped.status);
          setMessage(mapped.message ?? null);
          setErrorCode(mapped.errorCode ?? null);
          requestInFlight.current = false;
        },
        {
          enableHighAccuracy: false,
          timeout: GEO_TIMEOUT_MS,
          maximumAge: GEO_MAX_AGE_MS,
        },
      );
    } catch (err) {
      requestInFlight.current = false;
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Location could not be requested. Please try again.",
      );
      setErrorCode(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("geolocation" in navigator)) return;

    let permissionStatusRef: PermissionStatus | null = null;

    const init = async () => {
      if (!("permissions" in navigator) || !navigator.permissions.query) {
        if (autoRequest) requestLocation();
        return;
      }

      try {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });

        permissionStatusRef = permissionStatus;
        setStatus(permissionStateToStatus(permissionStatus.state));

        if (permissionStatus.state === "denied") {
          setMessage(
            "Location access is blocked. Enable it in your browser settings to see accurate distances.",
          );
          return;
        }

        if (autoRequest) {
          requestLocation();
        }

        permissionStatus.onchange = () => {
          const nextState = permissionStatus.state;
          setStatus(permissionStateToStatus(nextState));

          if (nextState === "denied") {
            setCoordinates(null);
            setMessage(
              "Location access is blocked. Enable it in your browser settings to see accurate distances.",
            );
            return;
          }

          if (nextState === "granted" && autoRequest) {
            requestLocation();
          }
        };
      } catch {
        if (autoRequest) requestLocation();
      }
    };

    void init();

    return () => {
      if (permissionStatusRef) {
        permissionStatusRef.onchange = null;
      }
    };
  }, [autoRequest, requestLocation]);

  return {
    status,
    coordinates,
    message,
    errorCode,
    requestLocation,
  };
};
