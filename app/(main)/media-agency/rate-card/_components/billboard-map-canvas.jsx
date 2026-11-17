"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.setView([center.lat, center.lng], map.getZoom() || 14, {
      animate: true,
    });
  }, [center, map]);
  return null;
}

export default function BillboardMapCanvas({ center, pin, onPick }) {
  const start = pin || center || { lat: 5.6037, lng: -0.187 };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={[start.lat, start.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="z-0 h-[240px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={onPick} />
        <Recenter center={pin || center} />
        {pin ? <Marker position={[pin.lat, pin.lng]} icon={markerIcon} /> : null}
      </MapContainer>
    </div>
  );
}
