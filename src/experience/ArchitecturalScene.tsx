import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = { progress: MutableRefObject<number>; reduced: boolean; mobile: boolean };

function Architecture({ progress, mobile }: Omit<Props, "reduced">) {
  const root = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const { camera, scene } = useThree();
  const city = useMemo(() => Array.from({ length: mobile ? 14 : 28 }, (_, i) => ({ x: (i % 7 - 3) * 1.7, z: Math.floor(i / 7) * -2.1 - 6, h: 0.8 + ((i * 7) % 6) * 0.43 })), [mobile]);

  useFrame((state, delta) => {
    const p = progress.current;
    const points = [
      new THREE.Vector3(8, 3.2, 11), new THREE.Vector3(5, 2.3, 5), new THREE.Vector3(-4.5, 1.5, 4),
      new THREE.Vector3(-1, 6.5, 10), new THREE.Vector3(0, 3.5, 14), new THREE.Vector3(7, 4, 12),
    ];
    const scaled = p * (points.length - 1);
    const idx = Math.min(points.length - 2, Math.floor(scaled));
    const local = THREE.MathUtils.smoothstep(scaled - idx, 0, 1);
    const target = points[idx].clone().lerp(points[idx + 1], local);
    camera.position.lerp(target, 1 - Math.pow(0.002, delta));
    camera.lookAt(0, p > .55 ? 0.5 : 1.1, p > .7 ? -5 : 0);
    if (root.current) {
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, -0.3 + p * 1.15, 0.035);
      root.current.position.y = Math.sin(state.clock.elapsedTime * .25) * .04;
    }
    if (light.current) light.current.intensity = 24 + Math.sin(p * Math.PI) * 55;
    const color = new THREE.Color().setHSL(.12 - p * .06, .16, .035 + p * .018);
    if (scene.background instanceof THREE.Color) scene.background.lerp(color, .02);
  });

  return <>
    <ambientLight intensity={1.6} color="#9ba6b5" />
    <directionalLight position={[6, 9, 7]} intensity={4.4} color="#f1e3cc" castShadow={!mobile} shadow-mapSize={[1024, 1024]} />
    <pointLight ref={light} position={[-4, 2, 3]} intensity={35} color="#d6a267" distance={18} />
    <group ref={root}>
      <mesh position={[0, -.35, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[50, 50]} /><meshStandardMaterial color="#11120f" roughness={.86} /></mesh>
      <RoundedBox args={[6.4, 1.35, 3.8]} radius={.035} position={[0, .35, 0]} castShadow><meshPhysicalMaterial color="#9f9a8d" roughness={.57} metalness={.05} /></RoundedBox>
      <RoundedBox args={[4.7, 1.75, 3.15]} radius={.025} position={[.75, 1.9, -.15]} castShadow><meshPhysicalMaterial color="#c9c2b1" roughness={.66} /></RoundedBox>
      <mesh position={[1.15, 1.82, 1.47]}><boxGeometry args={[3.45, 1.05, .05]} /><meshPhysicalMaterial color="#1e2525" roughness={.08} metalness={.35} transmission={.18} transparent opacity={.72} /></mesh>
      {[[-2.5, .48, 2.2], [3.4, .42, .7], [-3.15, .38, -.8]].map((position, i) => <mesh position={position as [number,number,number]} key={i} castShadow><boxGeometry args={[.45 + i * .12, .85, .45 + i * .12]} /><meshStandardMaterial color="#343d28" roughness={1} /></mesh>)}
      <mesh position={[-2.1, 1.65, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.65, .015, 8, 96]} /><meshBasicMaterial color="#cbb68f" transparent opacity={.5} /></mesh>
      <mesh position={[-2.1, 1.65, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.12, .007, 8, 96]} /><meshBasicMaterial color="#82785f" transparent opacity={.42} /></mesh>
      <group position={[0, 0, -7]}>{city.map((b, i) => <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow><boxGeometry args={[1.25, b.h, 1.35]} /><meshStandardMaterial color={i % 3 === 0 ? "#4d4a42" : "#2c2e2a"} roughness={.9} /></mesh>)}</group>
      <Float speed={.55} rotationIntensity={.08} floatIntensity={.15}><mesh position={[0, 4.9, -2]} rotation={[.8, 0, .2]}><torusGeometry args={[3.8, .018, 8, 160]} /><meshBasicMaterial color="#d7c5a6" transparent opacity={.34} /></mesh></Float>
    </group>
    <fog attach="fog" args={["#11120f", 11, 31]} />
  </>;
}

export default function ArchitecturalScene({ progress, reduced, mobile }: Props) {
  if (reduced) return null;
  return <Canvas className="experience-canvas" dpr={mobile ? [1, 1.15] : [1, 1.6]} gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: false }} camera={{ position: [8, 3.2, 11], fov: mobile ? 48 : 40 }} shadows={!mobile} fallback={<div className="webgl-fallback" />}><Architecture progress={progress} mobile={mobile} /></Canvas>;
}
