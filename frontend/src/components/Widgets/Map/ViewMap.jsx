import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import { MdMyLocation } from "react-icons/md";
import useVehicleData from "../../../hooks/useVehicleData";
import useGyroscopeData from "../../../hooks/useGyroscopeData";

const MapEventHandler = ({ onMapReady, onMapIdle }) => {
  useMapEvents({
    ready: (e) => onMapReady(e.target),
    dragend: onMapIdle,
    zoomend: onMapIdle,
  });
  return null;
};

const ViewMap = ({ darkMode, selectedVehicle, vehicles: propVehicles }) => {
  const [showFocusButton, setShowFocusButton] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userInteractedRef = useRef(false);
  const iconCacheRef = useRef({});

  const { vehicles: hookVehicles } = useVehicleData();
  const vehicles = propVehicles || hookVehicles;
  const { gyroscopeData } = useGyroscopeData(selectedVehicle?.id);

  const handleMapReady = (map) => {
    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    checkDistanceFromVehicle(map);
  };

  const handleMapIdle = useCallback(() => {
    userInteractedRef.current = true;
    checkDistanceFromVehicle();
  }, []);

  const checkDistanceFromVehicle = useCallback(
    (mapArg = null) => {
      const map = mapArg || mapInstanceRef.current;
      if (!map || !selectedVehicle) return;

      const vehicle = vehicles.find(
        (v) => String(v.id) === String(selectedVehicle)
      );
      if (!vehicle?.latitude || !vehicle?.longitude) return;

      const center = map.getCenter();
      const distance = center.distanceTo([vehicle.latitude, vehicle.longitude]);

      setShowFocusButton(distance > 1000);
    },
    [vehicles, selectedVehicle]
  );

  const focusToVehicle = (e) => {
    e?.preventDefault();
    const map = mapInstanceRef.current;
    if (!map || !selectedVehicle) return;

    const vehicle = vehicles.find(
      (v) => String(v.id) === String(selectedVehicle)
    );
    if (!vehicle?.latitude || !vehicle?.longitude) return;

    map.setView([vehicle.latitude, vehicle.longitude], 15, {
      animate: true,
      duration: 1.0,
    });

    userInteractedRef.current = false;
    setShowFocusButton(false);
  };

  const createArrowIcon = (id, heading = 0, isSelected = false) => {
    const key = `${id}-${Math.round(heading)}-${isSelected}`;
    if (iconCacheRef.current[key]) return iconCacheRef.current[key];

    const color = isSelected ? "#ef4444" : "#2563eb";
    const size = isSelected ? 30 : 25;

    const icon = L.divIcon({
      html: `
        <div style="
          width:${size}px;
          height:${size}px;
          transform: rotate(${heading}deg);
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24">
            <rect x="10" y="8" width="4" height="10" rx="1"
              fill="${color}" stroke="white" stroke-width="1"/>
            <path d="M12 2 L17 8 L14 8 L14 10 L10 10 L10 8 L7 8 Z"
              fill="white" stroke="${color}" stroke-width="1.5"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

    iconCacheRef.current[key] = icon;
    return icon;
  };

  useEffect(() => {
    if (
      mapInstanceRef.current &&
      selectedVehicle &&
      vehicles.length > 0 &&
      !userInteractedRef.current
    ) {
      const vehicle = vehicles.find(
        (v) => String(v.id) === String(selectedVehicle)
      );
      if (vehicle?.latitude && vehicle?.longitude) {
        mapInstanceRef.current.setView(
          [vehicle.latitude, vehicle.longitude],
          15,
          { animate: true, duration: 1.0 }
        );
      }
    }
  }, [selectedVehicle, vehicles]);

  return (
    <div className="relative w-full h-full z-50">
      {selectedVehicle && showFocusButton && (
        <button
          onClick={focusToVehicle}
          className="absolute top-4 right-4 z-[9999] w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg flex items-center justify-center"
        >
          <MdMyLocation className="w-6 h-6" />
        </button>
      )}

      <MapContainer
        ref={mapRef}
        scrollWheelZoom
        center={[-6.86, 108.103]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        worldCopyJump={false}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1.0}
        minZoom={2}
      >
        <MapEventHandler
          onMapReady={handleMapReady}
          onMapIdle={handleMapIdle}
        />

        <TileLayer
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          noWrap={true}
          updateWhenIdle
          updateWhenZooming={false}
          keepBuffer={2}
        />

        {vehicles.map((vehicle) => {
          if (!vehicle.latitude || !vehicle.longitude) return null;

          const isSelected = String(vehicle.id) === String(selectedVehicle);
          const heading = isSelected && gyroscopeData ? gyroscopeData.yaw : 0;

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={createArrowIcon(vehicle.id, heading, isSelected)}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold">{vehicle.name || "Unknown"}</h3>
                  <p>
                    {vehicle.latitude.toFixed(4)},{" "}
                    {vehicle.longitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ViewMap;
