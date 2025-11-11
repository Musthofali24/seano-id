import {
  MapContainer,
  TileLayer,
  GeoJSON,
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

// Component untuk mendeteksi zoom changes
const MapEventHandler = ({ onZoomChange, onMapReady, onUserInteraction }) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
    ready: () => {
      onMapReady(map);
    },
    dragstart: () => {
      onUserInteraction();
    },
    zoomstart: () => {
      onUserInteraction();
    },
  });
  return null;
};

const ViewMap = ({ darkMode, selectedVehicle, vehicles: propVehicles }) => {
  // const [landData, setLandData] = useState(null);
  const [showFocusButton, setShowFocusButton] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const mapRef = useRef();
  const mapInstanceRef = useRef();

  // Use vehicles from props if provided, otherwise fallback to hook
  const { vehicles: hookVehicles } = useVehicleData();
  const vehicles = propVehicles || hookVehicles;
  const { gyroscopeData } = useGyroscopeData(selectedVehicle);

  // Debug vehicles data
  console.log(
    "ViewMap vehicles:",
    vehicles.length,
    vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      lat: v.latitude?.toFixed(4),
      lng: v.longitude?.toFixed(4),
    }))
  );

  // Handle zoom changes dan map ready
  const handleZoomChange = () => {
    // We don't need to track zoom anymore, focus is based on distance
  };

  const handleMapReady = (mapInstance) => {
    mapInstanceRef.current = mapInstance;
    checkDistanceFromVehicle(mapInstance);
  };

  const handleUserInteraction = () => {
    setUserInteracted(true);
    setTimeout(() => checkDistanceFromVehicle(), 100);
  };

  // Check if map center is far from selected vehicle
  const checkDistanceFromVehicle = useCallback(
    (mapInstance = null) => {
      const map = mapInstance || mapInstanceRef.current;
      if (map && selectedVehicle && vehicles.length > 0) {
        const vehicle = vehicles.find(
          (v) => String(v.id) === String(selectedVehicle)
        );
        if (vehicle && vehicle.latitude && vehicle.longitude) {
          const center = map.getCenter();
          const distance = center.distanceTo([
            vehicle.latitude,
            vehicle.longitude,
          ]);

          // Show focus button if more than 1km away from vehicle
          setShowFocusButton(distance > 1000);
        }
      } else {
        setShowFocusButton(false);
      }
    },
    [selectedVehicle, vehicles]
  );

  // Function to focus back to selected vehicle
  const focusToVehicle = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const map = mapRef.current || mapInstanceRef.current;
    if (map && selectedVehicle && vehicles.length > 0) {
      const vehicle = vehicles.find(
        (v) => String(v.id) === String(selectedVehicle)
      );

      if (vehicle && vehicle.latitude && vehicle.longitude) {
        map.setView([vehicle.latitude, vehicle.longitude], 15);

        setTimeout(() => {
          map.setView([vehicle.latitude, vehicle.longitude], 15, {
            animate: true,
            duration: 1.0,
          });
        }, 50);

        setShowFocusButton(false);
        setUserInteracted(false);
      }
    }
  };

  // Create custom arrow icon that rotates based on heading
  const createArrowIcon = (heading = 0, isSelected = false) => {
    const color = isSelected ? "#ef4444" : "#2563eb";
    const size = isSelected ? 30 : 25;

    // Vehicle forward direction arrow
    // Arrow points in the direction the vehicle is moving/facing
    // 0° = vehicle moving North, 90° = vehicle moving East, etc.
    const rotation = heading;

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px; 
          height: ${size}px; 
          transform: rotate(${rotation}deg);
          display: flex;
          align-items: center;
          justify-content: center;
          transform-origin: center center;
        ">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Vehicle body (rectangular hull) -->
            <rect x="10" y="8" width="4" height="10" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="1"
                  rx="1"/>
            <!-- Forward arrow (bow/front of vehicle) clearly showing direction -->
            <path d="M12 2 L17 8 L14 8 L14 10 L10 10 L10 8 L7 8 Z" 
                  fill="white" 
                  stroke="${color}" 
                  stroke-width="1.5"
                  stroke-linejoin="round"/>
            <!-- Center dot for reference -->
            <circle cx="12" cy="12" r="1" fill="white" stroke="${color}" stroke-width="1"/>
          </svg>
        </div>
      `,
      className: "custom-arrow-icon",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Helper function to get direction name from heading
  const getDirectionName = (heading) => {
    const directions = [
      { name: "N", min: 0, max: 11.25 },
      { name: "NNE", min: 11.25, max: 33.75 },
      { name: "NE", min: 33.75, max: 56.25 },
      { name: "ENE", min: 56.25, max: 78.75 },
      { name: "E", min: 78.75, max: 101.25 },
      { name: "ESE", min: 101.25, max: 123.75 },
      { name: "SE", min: 123.75, max: 146.25 },
      { name: "SSE", min: 146.25, max: 168.75 },
      { name: "S", min: 168.75, max: 191.25 },
      { name: "SSW", min: 191.25, max: 213.75 },
      { name: "SW", min: 213.75, max: 236.25 },
      { name: "WSW", min: 236.25, max: 258.75 },
      { name: "W", min: 258.75, max: 281.25 },
      { name: "WNW", min: 281.25, max: 303.75 },
      { name: "NW", min: 303.75, max: 326.25 },
      { name: "NNW", min: 326.25, max: 348.75 },
      { name: "N", min: 348.75, max: 360 },
    ];

    const normalizedHeading = ((heading % 360) + 360) % 360;
    const direction = directions.find(
      (d) => normalizedHeading >= d.min && normalizedHeading < d.max
    );

    return direction ? direction.name : "N";
  };

  useEffect(() => {
    fetch("/indonesia_land.json").then((res) => res.json());
    // .then((data) => setLandData(data));
  }, []);

  // Check distance from vehicle regularly
  useEffect(() => {
    if (selectedVehicle && vehicles.length > 0) {
      checkDistanceFromVehicle();

      const interval = setInterval(() => {
        checkDistanceFromVehicle();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [selectedVehicle, vehicles, checkDistanceFromVehicle]);

  // Auto zoom to selected vehicle hanya sekali per vehicle selection
  useEffect(() => {
    if (
      mapRef.current &&
      selectedVehicle &&
      vehicles.length > 0 &&
      !userInteracted
    ) {
      const vehicle = vehicles.find(
        (v) => String(v.id) === String(selectedVehicle)
      );
      if (vehicle && vehicle.latitude && vehicle.longitude) {
        const map = mapRef.current;
        map.setView([vehicle.latitude, vehicle.longitude], 15, {
          animate: true,
          duration: 1.0,
        });
        setShowFocusButton(false);
      }
    }
  }, [selectedVehicle, vehicles, userInteracted]);

  // Reset interaction tracking when vehicle changes
  useEffect(() => {
    setUserInteracted(false);
    setShowFocusButton(false);
  }, [selectedVehicle]);

  return (
    <div className="relative w-full h-full z-50">
      {selectedVehicle && (
        <button
          type="button"
          onClick={focusToVehicle}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          data-no-extension="true"
          title={
            showFocusButton
              ? "Focus to Vehicle (Far)"
              : "Focus to Vehicle (Near)"
          }
          style={{
            zIndex: 9999,
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
          }}
          className={`bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 hover:shadow-xl hover:scale-105 absolute top-4 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 text-white dark:text-black cursor-pointer`}
        >
          <MdMyLocation className="w-6 h-6 pointer-events-none" />
        </button>
      )}

      <MapContainer
        ref={mapRef}
        scrollWheelZoom={true}
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
          onZoomChange={handleZoomChange}
          onMapReady={handleMapReady}
          onUserInteraction={handleUserInteraction}
        />
        <TileLayer
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          noWrap={true}
        />
        {/* 
        {landData && (
          <GeoJSON
            data={landData}
            style={{
              color: "black",
              weight: 5,
              fillColor: "black",
              fillOpacity: 0.3,
            }}
          />
        )} */}

        {vehicles.map((vehicle) => {
          if (!vehicle.latitude || !vehicle.longitude) return null;

          const isSelected = String(vehicle.id) === String(selectedVehicle);
          const heading = isSelected && gyroscopeData ? gyroscopeData.yaw : 0;

          // Debug: Log vehicle position and heading alignment
          if (isSelected) {
            console.log(
              `Vehicle ${vehicle.id} at [${vehicle.latitude.toFixed(
                4
              )}, ${vehicle.longitude.toFixed(4)}] heading ${Math.round(
                heading
              )}°`
            );
          }

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={createArrowIcon(heading, isSelected)}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-800">
                    {vehicle.name}
                  </h3>
                  <p className="text-gray-600">Code: {vehicle.code}</p>
                  <p className="text-gray-600">Status: {vehicle.status}</p>
                  <p className="text-gray-600">
                    Battery: {vehicle.battery_level}%
                  </p>
                  <p className="text-gray-600">
                    Heading: {Math.round(heading)}° ({getDirectionName(heading)}
                    )
                  </p>
                  <p className="text-gray-600">
                    Position: {vehicle.latitude.toFixed(4)},{" "}
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
