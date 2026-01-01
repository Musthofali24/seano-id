import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

// Komponen Catamaran USV Model
const USVModel = ({ position, rotation }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      // Apply gyroscope rotation
      meshRef.current.rotation.x = rotation.pitch;
      meshRef.current.rotation.z = rotation.roll;
      meshRef.current.rotation.y = rotation.yaw;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Left Hull (Port) - Catamaran style */}
      <group position={[0, 0, -0.8]}>
        {/* Main hull body */}
        <Box args={[2.2, 0.3, 0.4]} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#1e40af" />
        </Box>
        {/* Bow taper */}
        <Box args={[0.4, 0.25, 0.35]} position={[1.3, -0.05, 0]}>
          <meshStandardMaterial color="#1d4ed8" />
        </Box>
        {/* Stern taper */}
        <Box args={[0.3, 0.2, 0.3]} position={[-1.25, -0.05, 0]}>
          <meshStandardMaterial color="#1e3a8a" />
        </Box>
      </group>

      {/* Right Hull (Starboard) - Mirror of left */}
      <group position={[0, 0, 0.8]}>
        {/* Main hull body */}
        <Box args={[2.2, 0.3, 0.4]} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#1e40af" />
        </Box>
        {/* Bow taper */}
        <Box args={[0.4, 0.25, 0.35]} position={[1.3, -0.05, 0]}>
          <meshStandardMaterial color="#1d4ed8" />
        </Box>
        {/* Stern taper */}
        <Box args={[0.3, 0.2, 0.3]} position={[-1.25, -0.05, 0]}>
          <meshStandardMaterial color="#1e3a8a" />
        </Box>
      </group>

      {/* Platform deck connecting the hulls */}
      <Box args={[2.0, 0.1, 1.4]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>

      {/* Control tower/cabin */}
      <group position={[0.2, 0.5, 0]}>
        <Box args={[0.8, 0.6, 0.8]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#374151" />
        </Box>
        {/* Windows */}
        <Box args={[0.1, 0.3, 0.6]} position={[0.35, 0.1, 0]}>
          <meshStandardMaterial color="#60a5fa" transparent opacity={0.7} />
        </Box>
        <Box args={[0.6, 0.3, 0.1]} position={[0, 0.1, 0.35]}>
          <meshStandardMaterial color="#60a5fa" transparent opacity={0.7} />
        </Box>
        <Box args={[0.6, 0.3, 0.1]} position={[0, 0.1, -0.35]}>
          <meshStandardMaterial color="#60a5fa" transparent opacity={0.7} />
        </Box>
      </group>

      {/* Navigation equipment */}
      <group position={[0.2, 1.1, 0]}>
        {/* Main mast */}
        <Box args={[0.03, 0.8, 0.03]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#374151" />
        </Box>
        {/* Radar dome */}
        <Sphere args={[0.12]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color="#6b7280" />
        </Sphere>
        {/* Navigation light */}
        <Sphere args={[0.05]} position={[0, 0.8, 0]}>
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.5}
          />
        </Sphere>
      </group>

      {/* Side antennas */}
      <Box args={[0.02, 0.4, 0.02]} position={[-0.5, 0.9, -0.6]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      <Box args={[0.02, 0.4, 0.02]} position={[-0.5, 0.9, 0.6]}>
        <meshStandardMaterial color="#374151" />
      </Box>

      {/* Thrusters/propulsion (visual indication) */}
      <Sphere args={[0.08]} position={[-1.4, -0.1, -0.8]}>
        <meshStandardMaterial color="#dc2626" />
      </Sphere>
      <Sphere args={[0.08]} position={[-1.4, -0.1, 0.8]}>
        <meshStandardMaterial color="#dc2626" />
      </Sphere>

      {/* Equipment boxes on deck */}
      <Box args={[0.3, 0.2, 0.2]} position={[-0.6, 0.25, 0.4]}>
        <meshStandardMaterial color="#4b5563" />
      </Box>
      <Box args={[0.3, 0.2, 0.2]} position={[-0.6, 0.25, -0.4]}>
        <meshStandardMaterial color="#4b5563" />
      </Box>

      {/* Solar panels (optional) */}
      <Box args={[1.0, 0.02, 0.6]} position={[-0.8, 0.4, 0]}>
        <meshStandardMaterial color="#1f2937" />
      </Box>
    </group>
  );
};

// Coordinate system axes
const CoordinateAxes = () => {
  return (
    <group>
      {/* X-axis (Red) */}
      <Line
        points={[
          [-3, 0, 0],
          [3, 0, 0],
        ]}
        color="red"
        lineWidth={2}
      />
      <Text position={[3.2, 0, 0]} fontSize={0.3} color="red" anchorX="left">
        X (Roll)
      </Text>

      {/* Y-axis (Green) */}
      <Line
        points={[
          [0, -3, 0],
          [0, 3, 0],
        ]}
        color="green"
        lineWidth={2}
      />
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.3}
        color="green"
        anchorX="center"
      >
        Y (Pitch)
      </Text>

      {/* Z-axis (Blue) */}
      <Line
        points={[
          [0, 0, -3],
          [0, 0, 3],
        ]}
        color="blue"
        lineWidth={2}
      />
      <Text position={[0, 0, 3.2]} fontSize={0.3} color="blue" anchorX="center">
        Z (Yaw)
      </Text>

      {/* Origin point */}
      <Sphere args={[0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial color="white" />
      </Sphere>
    </group>
  );
};

// Grid helper
const GridPlane = () => {
  return (
    <group>
      <gridHelper args={[6, 10, "#4a5568", "#2d3748"]} position={[0, -2, 0]} />
      <axesHelper args={[2]} position={[0, -1.8, 0]} />
    </group>
  );
};

const Gyroscope3D = ({ gyroscopeData }) => {
  const [rotation, setRotation] = useState({
    pitch: 0, // X rotation
    roll: 0, // Z rotation
    yaw: 0, // Y rotation
  });

  useEffect(() => {
    if (gyroscopeData) {
      setRotation({
        pitch: (gyroscopeData.pitch * Math.PI) / 180, // Convert degrees to radians
        roll: (gyroscopeData.roll * Math.PI) / 180,
        yaw: (gyroscopeData.yaw * Math.PI) / 180,
      });
    }
  }, [gyroscopeData]);

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-black rounded-2xl">
      {/* 2D Compass */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="flex items-center gap-4">
          {/* Compass Visual */}
          <div className="relative w-24 h-24">
            {/* Compass base circle */}
            <div className="absolute inset-0 border-4 border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700"></div>

            {/* Cardinal directions */}
            <div className="absolute inset-3 rounded-full">
              {/* North */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-sm font-bold text-red-500">
                N
              </div>
              {/* South */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-600 dark:text-gray-400">
                S
              </div>
              {/* East */}
              <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 text-sm font-bold text-gray-600 dark:text-gray-400">
                E
              </div>
              {/* West */}
              <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 text-sm font-bold text-gray-600 dark:text-gray-400">
                W
              </div>
            </div>

            {/* Compass needle container - properly centered */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* North needle (red) */}
              <div
                className="absolute origin-center transition-transform duration-500 ease-out"
                style={{
                  transform: `rotate(${gyroscopeData?.yaw || 0}deg)`,
                }}
              >
                {/* North arrow - pointing up */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{ top: "-20px" }}
                >
                  <div
                    className="w-0 h-0 border-l-3 border-r-3 border-b-5 border-l-transparent border-r-transparent border-b-red-500"
                    style={{
                      borderLeftWidth: "4px",
                      borderRightWidth: "4px",
                      borderBottomWidth: "20px",
                    }}
                  ></div>
                </div>

                {/* South arrow - pointing down */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{ top: "0px" }}
                >
                  <div
                    className="w-0 h-0 border-l-3 border-r-3 border-t-4 border-l-transparent border-r-transparent border-t-gray-400"
                    style={{
                      borderLeftWidth: "4px",
                      borderRightWidth: "4px",
                      borderTopWidth: "20px",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-800 dark:bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 border border-white dark:border-gray-800"></div>
          </div>

          {/* Compass data */}
          <div className="flex flex-col space-y-1">
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Heading:</span>{" "}
              {Math.round(gyroscopeData?.yaw || 0)}°
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Yaw:</span>{" "}
              {gyroscopeData?.yaw?.toFixed(1) || "0.0"}°
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Roll:</span>{" "}
              {gyroscopeData?.roll?.toFixed(1) || "0.0"}°
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Pitch:</span>{" "}
              {gyroscopeData?.pitch?.toFixed(1) || "0.0"}°
            </div>
          </div>
        </div>
      </div>

      <Canvas
        camera={{ position: [5, 3, 5], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />

        {/* 3D Scene */}
        <CoordinateAxes />
        <GridPlane />
        <USVModel position={[0, 0, 0]} rotation={rotation} />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
};

export default Gyroscope3D;
