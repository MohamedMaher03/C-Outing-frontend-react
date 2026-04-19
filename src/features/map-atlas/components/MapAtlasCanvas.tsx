import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LatLngBounds, type Map as LeafletMap } from "leaflet";
import Supercluster from "supercluster";
import type { Feature, Point } from "geojson";
import { useI18n } from "@/components/i18n";
import type { HomePlace, UserLocationState } from "@/features/home/types";
import type { ClusterPointProperties } from "@/features/map-atlas/types";
import {
  buildClusterFeatures,
  CAIRO_DEFAULT_BOUNDS,
  CAIRO_DEFAULT_CENTER,
  dedupePlacesById,
  hasValidCoordinates,
} from "@/features/map-atlas/utils/mapAtlas";
import { cn } from "@/lib/utils";

interface MapAtlasCanvasProps {
  places: HomePlace[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
  userLocation: UserLocationState;
  resolvedTheme: "light" | "dark";
  fitRequestToken: number;
  centerUserRequestToken: number;
}

const TILE_LAYERS = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  },
};

const MAP_MIN_ZOOM = 10;
const MAP_MAX_ZOOM = 18;

const CLUSTER_RING = "hsl(var(--navy))";
const CLUSTER_FILL = "hsl(var(--primary))";
const POINT_RING = "hsl(var(--primary))";
const POINT_FILL = "hsl(var(--navy))";
const POINT_FILL_ACTIVE = "hsl(var(--secondary))";
const USER_LOCATION_COLOR = "hsl(var(--ring))";

interface ClusterFeatureProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string;
}

type AtlasMapFeature =
  | Feature<Point, ClusterPointProperties>
  | Feature<Point, ClusterFeatureProperties>;

const isClusterFeature = (
  feature: AtlasMapFeature,
): feature is Feature<Point, ClusterFeatureProperties> =>
  (feature.properties as ClusterFeatureProperties).cluster === true;

const getClusterRadius = (pointCount: number) =>
  Math.max(16, Math.min(34, 14 + Math.log2(pointCount) * 4.5));

const getPlaceByIdMap = (places: HomePlace[]) =>
  new Map(places.map((place) => [place.id, place]));

function MapAtlasCanvas({
  places,
  selectedPlaceId,
  onSelectPlace,
  userLocation,
  resolvedTheme,
  fitRequestToken,
  centerUserRequestToken,
}: MapAtlasCanvasProps) {
  const { t, formatNumber } = useI18n();
  const mapRef = useRef<LeafletMap | null>(null);
  const shouldReduceMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const [zoom, setZoom] = useState(12);
  const [bbox, setBbox] = useState<[number, number, number, number]>([
    CAIRO_DEFAULT_BOUNDS[0][1],
    CAIRO_DEFAULT_BOUNDS[0][0],
    CAIRO_DEFAULT_BOUNDS[1][1],
    CAIRO_DEFAULT_BOUNDS[1][0],
  ]);

  const mapPlaces = useMemo(
    () => dedupePlacesById(places).filter(hasValidCoordinates),
    [places],
  );

  const placeById = useMemo(() => getPlaceByIdMap(mapPlaces), [mapPlaces]);

  const pointFeatures = useMemo(
    () => buildClusterFeatures(mapPlaces),
    [mapPlaces],
  );

  const clusterIndex = useMemo(() => {
    const index = new Supercluster({
      radius: 60,
      maxZoom: 17,
      minZoom: MAP_MIN_ZOOM,
      nodeSize: 64,
    });

    index.load(pointFeatures);
    return index;
  }, [pointFeatures]);

  const clusters = useMemo(
    () => clusterIndex.getClusters(bbox, Math.round(zoom)) as AtlasMapFeature[],
    [clusterIndex, bbox, zoom],
  );

  const updateViewportState = useCallback((map: LeafletMap) => {
    const bounds = map.getBounds();
    const nextBbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const nextZoom = map.getZoom();

    setBbox((previous) => {
      if (
        previous[0] === nextBbox[0] &&
        previous[1] === nextBbox[1] &&
        previous[2] === nextBbox[2] &&
        previous[3] === nextBbox[3]
      ) {
        return previous;
      }

      return nextBbox;
    });
    setZoom((previous) => (previous === nextZoom ? previous : nextZoom));
  }, []);

  const handleMapReady = useCallback(
    (map: LeafletMap) => {
      mapRef.current = map;
      updateViewportState(map);
    },
    [updateViewportState],
  );

  useEffect(() => {
    if (!selectedPlaceId || !mapRef.current) {
      return;
    }

    const selectedPlace = placeById.get(selectedPlaceId);
    if (!selectedPlace || !hasValidCoordinates(selectedPlace)) {
      return;
    }

    mapRef.current.flyTo(
      [selectedPlace.latitude, selectedPlace.longitude],
      Math.max(mapRef.current.getZoom(), 14),
      {
        duration: shouldReduceMotion ? 0 : 0.45,
      },
    );
  }, [placeById, selectedPlaceId, shouldReduceMotion]);

  useEffect(() => {
    if (fitRequestToken <= 0 || !mapRef.current || mapPlaces.length === 0) {
      return;
    }

    if (mapPlaces.length === 1) {
      const onlyPlace = mapPlaces[0];
      mapRef.current.flyTo([onlyPlace.latitude, onlyPlace.longitude], 14, {
        duration: shouldReduceMotion ? 0 : 0.5,
      });
      return;
    }

    const bounds = new LatLngBounds(
      mapPlaces.map((place) => [place.latitude, place.longitude]) as Array<
        [number, number]
      >,
    );

    mapRef.current.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
    });
  }, [fitRequestToken, mapPlaces, shouldReduceMotion]);

  useEffect(() => {
    if (centerUserRequestToken <= 0 || !mapRef.current) {
      return;
    }

    if (userLocation.status !== "granted" || !userLocation.coordinates) {
      return;
    }

    mapRef.current.flyTo(
      [userLocation.coordinates.latitude, userLocation.coordinates.longitude],
      Math.max(mapRef.current.getZoom(), 14),
      {
        duration: shouldReduceMotion ? 0 : 0.55,
      },
    );
  }, [centerUserRequestToken, shouldReduceMotion, userLocation]);

  const selectedPlace = selectedPlaceId
    ? (placeById.get(selectedPlaceId) ?? null)
    : null;

  return (
    <div className="relative isolate h-[clamp(20rem,56vh,34rem)] min-h-[20rem] w-full overflow-hidden rounded-3xl border border-border/70 shadow-lg lg:h-[clamp(24rem,64vh,42rem)]">
      <p className="sr-only">
        {t(
          "mapAtlas.map.keyboardHint",
          undefined,
          "Map markers are mirrored in the mapped places list for keyboard and screen-reader navigation.",
        )}
      </p>

      <MapContainer
        center={CAIRO_DEFAULT_CENTER}
        zoom={12}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        maxBounds={CAIRO_DEFAULT_BOUNDS}
        maxBoundsViscosity={0.85}
        attributionControl={false}
        zoomControl={false}
        className="map-atlas-surface h-full w-full"
        aria-hidden="true"
      >
        <ZoomControl position="bottomright" />

        <MapReadyBridge onReady={handleMapReady} />
        <MapViewportBridge onViewportChanged={updateViewportState} />

        <TileLayer
          url={
            resolvedTheme === "dark"
              ? TILE_LAYERS.dark.url
              : TILE_LAYERS.light.url
          }
          subdomains={["a", "b", "c", "d"]}
        />

        {clusters.map((feature) => {
          const [longitude, latitude] = feature.geometry.coordinates;

          if (isClusterFeature(feature)) {
            const pointCount = feature.properties.point_count;
            const clusterId = feature.properties.cluster_id;
            const radius = getClusterRadius(pointCount);

            return (
              <CircleMarker
                key={`cluster-${clusterId}`}
                center={[latitude, longitude]}
                radius={radius}
                pathOptions={{
                  color: CLUSTER_RING,
                  fillColor: CLUSTER_FILL,
                  fillOpacity: 0.9,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    if (!mapRef.current) {
                      return;
                    }

                    const expansionZoom = Math.min(
                      clusterIndex.getClusterExpansionZoom(clusterId),
                      17,
                    );

                    mapRef.current.flyTo([latitude, longitude], expansionZoom, {
                      duration: shouldReduceMotion ? 0 : 0.35,
                    });
                  },
                }}
              >
                <Tooltip
                  permanent
                  direction="center"
                  opacity={1}
                  className="!border-0 !bg-transparent !p-0 !shadow-none"
                >
                  <span className="text-role-micro font-bold text-[hsl(var(--foreground))]">
                    {formatNumber(pointCount)}
                  </span>
                </Tooltip>
              </CircleMarker>
            );
          }

          const placeId = feature.properties.placeId;
          const place = placeById.get(placeId);

          if (!place) {
            return null;
          }

          const isSelected = place.id === selectedPlaceId;

          return (
            <CircleMarker
              key={`place-${place.id}`}
              center={[latitude, longitude]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: isSelected ? CLUSTER_RING : POINT_RING,
                fillColor: isSelected ? POINT_FILL_ACTIVE : POINT_FILL,
                fillOpacity: isSelected ? 0.95 : 0.84,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  onSelectPlace(place.id);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <div className="space-y-0.5">
                  <p className="text-role-micro font-semibold">{place.name}</p>
                  <p className="text-role-micro text-muted-foreground">
                    {formatNumber(place.rating, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    / 5
                  </p>
                </div>
              </Tooltip>
              {isSelected && (
                <Popup closeButton={false} className="map-atlas-popup">
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      {place.name}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {place.address}
                    </p>
                    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/45 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                      <span>
                        {formatNumber(place.rating, {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                      </span>
                      <span>★</span>
                    </div>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          );
        })}

        {userLocation.status === "granted" && userLocation.coordinates && (
          <>
            <Circle
              center={[
                userLocation.coordinates.latitude,
                userLocation.coordinates.longitude,
              ]}
              radius={Math.max(
                userLocation.coordinates.accuracyMeters ?? 45,
                35,
              )}
              pathOptions={{
                color: USER_LOCATION_COLOR,
                fillColor: USER_LOCATION_COLOR,
                fillOpacity: 0.12,
                weight: 1,
              }}
            />
            <CircleMarker
              center={[
                userLocation.coordinates.latitude,
                userLocation.coordinates.longitude,
              ]}
              radius={7}
              pathOptions={{
                color: "hsl(var(--background))",
                fillColor: USER_LOCATION_COLOR,
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <span className="text-role-micro font-semibold">
                  {t("mapAtlas.map.userLocation", undefined, "Your location")}
                </span>
              </Tooltip>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      <div
        className={cn(
          "pointer-events-none absolute left-3 top-3 z-20 rounded-xl border px-3 py-2 text-role-caption shadow-sm backdrop-blur",
          "border-border/70 bg-card/88 text-foreground",
        )}
      >
        <p>
          {t(
            "mapAtlas.map.showing",
            { count: formatNumber(mapPlaces.length) },
            `Showing ${formatNumber(mapPlaces.length)} places`,
          )}
        </p>
        {selectedPlace && (
          <p className="text-role-micro mt-1 font-medium text-muted-foreground">
            {t(
              "mapAtlas.map.focused",
              { name: selectedPlace.name },
              `Focused: ${selectedPlace.name}`,
            )}
          </p>
        )}
      </div>

      {mapPlaces.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-background/82 backdrop-blur-[1px]">
          <div className="rounded-2xl border border-border/70 bg-card/95 px-5 py-4 text-center shadow-sm">
            <p className="text-role-secondary font-semibold text-foreground">
              {t("mapAtlas.map.empty.title", undefined, "No places to map yet")}
            </p>
            <p className="text-role-micro mt-1 text-muted-foreground">
              {t(
                "mapAtlas.map.empty.subtitle",
                undefined,
                "Change source, search, or filters to load map pins.",
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

MapAtlasCanvas.displayName = "MapAtlasCanvas";

interface MapViewportBridgeProps {
  onViewportChanged: (map: LeafletMap) => void;
}

function MapViewportBridge({ onViewportChanged }: MapViewportBridgeProps) {
  const map = useMapEvents({
    moveend: () => onViewportChanged(map),
    zoomend: () => onViewportChanged(map),
  });

  useEffect(() => {
    onViewportChanged(map);
  }, [map, onViewportChanged]);

  return null;
}

interface MapReadyBridgeProps {
  onReady: (map: LeafletMap) => void;
}

function MapReadyBridge({ onReady }: MapReadyBridgeProps) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  return null;
}

export default memo(MapAtlasCanvas);
