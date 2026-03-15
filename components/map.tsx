"use client";

import { Location } from "@/app/generated/prisma";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

interface MapProps {
  itineraries: Location[];
}

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:999px;background:radial-gradient(circle,#00C2FF 0%,#1B3A6B 70%);box-shadow:0 0 0 4px rgba(0,194,255,0.14),0 0 24px rgba(0,194,255,0.35);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapViewport({ itineraries }: MapProps) {
  const map = useMap();

  useEffect(() => {
    if (itineraries.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    if (itineraries.length === 1) {
      map.setView([itineraries[0].lat, itineraries[0].lng], 9);
      return;
    }

    const bounds = L.latLngBounds(
      itineraries.map((location) => [location.lat, location.lng] as [number, number])
    );

    map.fitBounds(bounds, { padding: [30, 30] });
  }, [itineraries, map]);

  return null;
}

export default function Map({ itineraries }: MapProps) {
  const center =
    itineraries.length > 0
      ? ([itineraries[0].lat, itineraries[0].lng] as [number, number])
      : ([20, 0] as [number, number]);

  const route = itineraries.map((location) => [location.lat, location.lng] as [number, number]);

  return (
    <MapContainer
      center={center}
      zoom={itineraries.length > 0 ? 8 : 2}
      scrollWheelZoom={true}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapViewport itineraries={itineraries} />
      {route.length > 1 ? (
        <Polyline positions={route} pathOptions={{ color: "#00C2FF", weight: 3, opacity: 0.8 }} />
      ) : null}
      {itineraries.map((location, index) => (
        <Marker key={location.id} position={[location.lat, location.lng]} icon={pinIcon}>
          <Popup>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{location.locationTitle}</p>
              <p className="text-xs text-slate-500">Stop {index + 1}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
