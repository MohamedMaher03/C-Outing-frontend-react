import type { HomePlace } from "@/features/home/types";

export type MapAtlasSource =
  | "discovery"
  | "curated"
  | "trending"
  | "mood"
  | "similar";

export interface MapAtlasSourceOption {
  id: MapAtlasSource;
  label: string;
  count: number;
  disabled?: boolean;
}

export interface ClusterPointProperties {
  placeId: string;
  name: string;
  rating: number;
  isOpen: boolean;
  isSaved: boolean;
}

export interface MapAtlasStats {
  total: number;
  openNow: number;
  saved: number;
  averageRating: number;
}

export interface ClusteredPlace extends HomePlace {
  latitude: number;
  longitude: number;
}
