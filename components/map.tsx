"use client";

import { Location } from "@/app/generated/prisma";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

interface MapProps {
  itineraries: Location[];
}

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function MapViewport({ itineraries }: MapProps) {
  const map = useMap();

  useEffect(() => {
    if (itineraries.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    if (itineraries.length === 1) {
      map.setView([itineraries[0].lat, itineraries[0].lng], 8);
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

  return (
    <MapContainer
      center={center}
      zoom={itineraries.length > 0 ? 8 : 2}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport itineraries={itineraries} />
      {itineraries.map((location, key) => (
        <Marker
          key={key}
          position={[location.lat, location.lng]}
        >
          <Popup>{location.locationTitle}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
