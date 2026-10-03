import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useRescueGridStore } from "@/lib/rescuegrid-store";

function Pulse({ position, critical }: { position: [number, number, number]; critical: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const pulse = 1 + ((clock.elapsedTime * 0.55) % 1) * 1.5;
    ring.current.scale.setScalar(pulse);
    const material = ring.current.material as THREE.MeshBasicMaterial;
    material.opacity = Math.max(0, 0.6 - (pulse - 1) * 0.4);
  });
  return (
    <group position={position}>
      <Float speed={2.5} rotationIntensity={0.12} floatIntensity={0.35}>
        <mesh position-y={0.45}>
          <octahedronGeometry args={[0.17, 0]} />
          <meshStandardMaterial color={critical ? "#ff395b" : "#21d4c2"} emissive={critical ? "#ff163e" : "#0ba99b"} emissiveIntensity={3} />
        </mesh>
      </Float>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.03}>
        <ringGeometry args={[0.16, 0.2, 40]} />
        <meshBasicMaterial color={critical ? "#ff395b" : "#21d4c2"} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Campus() {
  const incidents = useRescueGridStore((state) => state.incidents);
  const scan = useRef<THREE.Group>(null);
  const buildings = useMemo(() => [
    [-2.6, 0.6, -1.2, 1.4, 0.48, 1.1], [-1, 0.4, -1.5, 1.1, 0.35, 0.8], [0.7, 0.75, -1.15, 1.5, 0.65, 1],
    [2.3, 0.45, -1.45, 0.9, 0.35, 0.9], [-2, 0.35, 0.7, 1.2, 0.28, 0.75], [-0.2, 0.62, 0.45, 1.55, 0.52, 1.2],
    [1.7, 0.48, 0.8, 1.1, 0.4, 0.8], [2.8, 0.68, 0.1, 0.7, 0.58, 1.25],
  ], []);
  useFrame((_, delta) => {
    if (scan.current) scan.current.rotation.y += delta * 0.12;
  });
  return (
    <group rotation-x={-0.05}>
      <gridHelper args={[10, 40, "#149b94", "#153449"]} position-y={-0.03} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#06131d" metalness={0.48} roughness={0.72} />
      </mesh>
      {buildings.map(([x, y, z, w, h, d], index) => (
        <group key={index} position={[x ?? 0, y ?? 0, z ?? 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w ?? 1, (y ?? 0.5) * 2, d ?? 1]} />
            <meshStandardMaterial color="#102a3a" metalness={0.65} roughness={0.38} emissive="#0a5b60" emissiveIntensity={0.18} />
          </mesh>
          <mesh position-y={(y ?? 0.5) + 0.012} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[(w ?? 1) * 0.84, (d ?? 1) * 0.84]} />
            <meshBasicMaterial color="#42e8d2" transparent opacity={0.14} />
          </mesh>
        </group>
      ))}
      {incidents.filter((item) => item.status !== "Resolved").map((incident) => (
        <Pulse key={incident.id} position={[incident.coordinates[0], 0.1, incident.coordinates[1]]} critical={incident.priority === "Critical"} />
      ))}
      <group ref={scan}>
        <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
          <ringGeometry args={[2.95, 3, 96]} />
          <meshBasicMaterial color="#20d6c3" transparent opacity={0.14} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[3, 48, 0, 0.13]} />
          <meshBasicMaterial color="#34ead1" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export function CommandScene() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} shadows camera={{ position: [5.7, 6.1, 7.5], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={["#050a10"]} />
        <fog attach="fog" args={["#050a10", 8, 18]} />
        <ambientLight intensity={0.55} color="#9bc8d5" />
        <directionalLight position={[4, 8, 5]} intensity={2.2} color="#d5f9f3" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-3, 2, 2]} intensity={18} distance={8} color="#ff234f" />
        <pointLight position={[3, 3, -2]} intensity={14} distance={8} color="#17c9bd" />
        <Campus />
        <Environment>
          <Lightformer intensity={2} color="#9ef8ef" position={[0, 6, 0]} scale={[8, 8, 1]} />
          <Lightformer intensity={2} color="#ff3158" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}