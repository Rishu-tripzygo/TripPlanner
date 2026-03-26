"use client";

import { Location } from "@/app/generated/prisma";
import { formatDistanceKm, getRouteSummary } from "@/lib/route-metrics";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

interface MapProps {
  itineraries: Location[];
  origin?: {
    label: string;
    lat: number;
    lng: number;
  } | null;
  returnToOrigin?: boolean;
}

const originIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:999px;background:radial-gradient(circle,#F59E0B 0%,#A16207 70%);box-shadow:0 0 0 4px rgba(245,158,11,0.16),0 0 24px rgba(245,158,11,0.28);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function stopIcon(index: number) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:linear-gradient(135deg,#1B3A6B,#00C2FF);box-shadow:0 0 0 4px rgba(0,194,255,0.14),0 0 24px rgba(0,194,255,0.28);color:white;font-size:12px;font-weight:700;">${index}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapViewport({ itineraries, origin, returnToOrigin = true }: MapProps) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];

    if (origin) {
      points.push([origin.lat, origin.lng]);
    }

    points.push(
      ...itineraries.map((location) => [location.lat, location.lng] as [number, number])
    );

    if (origin && returnToOrigin && itineraries.length > 0) {
      points.push([origin.lat, origin.lng]);
    }

    if (points.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 9);
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, { padding: [30, 30] });
  }, [itineraries, map, origin, returnToOrigin]);

  return null;
}

export default function Map({ itineraries, origin, returnToOrigin = true }: MapProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const center =
    origin
      ? ([origin.lat, origin.lng] as [number, number])
      : itineraries.length > 0
        ? ([itineraries[0].lat, itineraries[0].lng] as [number, number])
        : ([20, 0] as [number, number]);
  const routeSummary = useMemo(
    () =>
      getRouteSummary({
        locations: itineraries,
        origin,
        returnToOrigin,
      }),
    [itineraries, origin, returnToOrigin]
  );
  const route = routeSummary.segments.flatMap((segment, index) =>
    index === 0
      ? [
          [segment.from.lat, segment.from.lng] as [number, number],
          [segment.to.lat, segment.to.lng] as [number, number],
        ]
      : [[segment.to.lat, segment.to.lng] as [number, number]]
  );
  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-[500] flex gap-2">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`rounded-full px-3 py-2 text-xs font-semibold ${
            theme === "light"
              ? "bg-white text-[#14518b] shadow-[0_10px_24px_rgba(20,81,139,0.12)]"
              : "bg-white/70 text-[#61738C]"
          }`}
        >
          Light map
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`rounded-full px-3 py-2 text-xs font-semibold ${
            theme === "dark"
              ? "bg-[#14518b] text-white shadow-[0_10px_24px_rgba(20,81,139,0.16)]"
              : "bg-white/70 text-[#61738C]"
          }`}
        >
          Dark map
        </button>
      </div>

      {routeSummary.segments.length > 0 ? (
        <div className="absolute bottom-4 left-4 z-[500] max-w-[280px] rounded-[18px] border border-white/55 bg-white/88 px-4 py-3 text-xs leading-6 text-[#46617c] shadow-[0_12px_28px_rgba(20,81,139,0.1)] backdrop-blur-xl">
          <p className="font-semibold text-[#0f3460]">
            Approx. route distance: {formatDistanceKm(routeSummary.totalDistanceKm)}
          </p>
          <p className="mt-1">
            {routeSummary.segments.length} leg{routeSummary.segments.length === 1 ? "" : "s"} ·
            longest leg {formatDistanceKm(routeSummary.longestSegmentKm)}
          </p>
          <p className="mt-1 text-[#7a8ea8]">
            Distances are straight-line estimates for route planning.
          </p>
        </div>
      ) : null}

      <MapContainer
        center={center}
        zoom={itineraries.length > 0 ? 8 : 2}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        <MapViewport itineraries={itineraries} origin={origin} returnToOrigin={returnToOrigin} />
        {route.length > 1 ? (
          <Polyline positions={route} pathOptions={{ color: "#00C2FF", weight: 3, opacity: 0.8 }} />
        ) : null}
        {origin ? (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{origin.label}</p>
                <p className="text-xs text-slate-500">Home base</p>
                {routeSummary.segments[0]?.from.kind === "origin" ? (
                  <p className="text-xs text-slate-500">
                    First leg: {formatDistanceKm(routeSummary.segments[0].distanceKm)}
                  </p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ) : null}
        {itineraries.map((location, index) => {
          const incomingSegment = routeSummary.segments.find((segment) => segment.to.id === location.id);
          const outgoingSegment = routeSummary.segments.find((segment) => segment.from.id === location.id);

          return (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={stopIcon(index + 1)}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{location.locationTitle}</p>
                  <p className="text-xs text-slate-500">Stop {index + 1}</p>
                  {incomingSegment ? (
                    <p className="text-xs text-slate-500">
                      Arrive from {incomingSegment.from.label}: {formatDistanceKm(incomingSegment.distanceKm)}
                    </p>
                  ) : null}
                  {outgoingSegment ? (
                    <p className="text-xs text-slate-500">
                      Next leg to {outgoingSegment.to.label}: {formatDistanceKm(outgoingSegment.distanceKm)}
                    </p>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
