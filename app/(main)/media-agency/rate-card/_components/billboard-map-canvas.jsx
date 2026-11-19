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

export default function BillboardMapCanvas({
  center,
  pin,
  onPick,
  interactive = true,
  className,
  heightClassName = "h-[240px]",
}) {
  const start = pin || center || { lat: 5.6037, lng: -0.187 };
  const canPick = Boolean(interactive && onPick);

  return (
    <div
      className={
        className || "overflow-hidden rounded-xl border border-slate-200"
      }
    >
      <MapContainer
        center={[start.lat, start.lng]}
        zoom={14}
        scrollWheelZoom={false}
        dragging={canPick || interactive}
        doubleClickZoom={canPick}
        className={`z-0 w-full ${heightClassName}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {canPick ? <MapClickHandler onPick={onPick} /> : null}
        <Recenter center={pin || center} />
        {pin ? <Marker position={[pin.lat, pin.lng]} icon={markerIcon} /> : null}
      </MapContainer>
    </div>
  );
}
