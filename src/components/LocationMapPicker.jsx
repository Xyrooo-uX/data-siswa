import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEvents({ onSelectLocation }) {
  useMapEvents({
    click(event) {
      onSelectLocation([event.latlng.lat, event.latlng.lng]);
    }
  });

  return null;
}

function RecenterMap({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, map, zoom]);

  return null;
}

function LocationMarker({ location, onSelectLocation }) {
  return (
    <Marker
      position={location}
      icon={defaultIcon}
      draggable
      eventHandlers={{
        dragend(event) {
          const position = event.target.getLatLng();
          onSelectLocation([position.lat, position.lng]);
        }
      }}
    />
  );
}

export default function LocationMapPicker({ center, zoom, location, onSelectLocation }) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="location-map"
      scrollWheelZoom
    >
      <RecenterMap center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onSelectLocation={onSelectLocation} />
      {location && <LocationMarker location={location} onSelectLocation={onSelectLocation} />}
    </MapContainer>
  );
}
