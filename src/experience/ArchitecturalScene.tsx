import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, PerformanceMonitor, useGLTF, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { MutableRefObject, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  progress: MutableRefObject<number>;
  mobile: boolean;
  visible: boolean;
  recoveryEpoch: number;
  onRendererCreated: () => void;
  onReady: () => void;
  onContextLost: () => void;
  onContextRestored: () => void;
};

type Placement = [number, number, number, number, number];
const MODEL_ROOT = "/experience/models/";

function configureTexture(texture: THREE.Texture, repeat: [number, number], color: boolean, mobile: boolean) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = mobile ? 4 : 8;
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
}

function PbrLandscape({ mobile }: { mobile: boolean }) {
  const suffix = mobile ? "-mobile" : "";
  const ground = useTexture({
    map: `/experience/textures/aerial_grass_rock_Diffuse${suffix}.jpg`,
    normalMap: `/experience/textures/aerial_grass_rock_nor_gl${suffix}.jpg`,
    roughnessMap: `/experience/textures/aerial_grass_rock_Rough${suffix}.jpg`,
    displacementMap: `/experience/textures/aerial_grass_rock_Displacement${suffix}.jpg`,
  });
  const paving = useTexture({
    map: `/experience/textures/concrete_pavement_02_Diffuse${suffix}.jpg`,
    normalMap: `/experience/textures/concrete_pavement_02_nor_gl${suffix}.jpg`,
    roughnessMap: `/experience/textures/concrete_pavement_02_Rough${suffix}.jpg`,
    displacementMap: `/experience/textures/concrete_pavement_02_Displacement${suffix}.jpg`,
  });
  const groundNormalScale = useMemo(() => new THREE.Vector2(0.8, 0.8), []);
  const pavingNormalScale = useMemo(() => new THREE.Vector2(0.7, 0.7), []);

  useLayoutEffect(() => {
    Object.entries(ground).forEach(([key, texture]) => configureTexture(texture, [7, 7], key === "map", mobile));
    Object.entries(paving).forEach(([key, texture]) => configureTexture(texture, [4, 2], key === "map", mobile));
  }, [ground, mobile, paving]);

  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]} receiveShadow>
      <planeGeometry args={[78, 78, mobile ? 72 : 96, mobile ? 72 : 96]} />
      <meshStandardMaterial {...ground} color="#66705a" roughness={0.94} displacementScale={0.72} displacementBias={-0.16} normalScale={groundNormalScale} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0.045]} position={[-0.8, -0.28, 12.6]} receiveShadow>
      <planeGeometry args={[28, 13, mobile ? 36 : 44, mobile ? 14 : 18]} />
      <meshStandardMaterial {...paving} color="#b4ada0" roughness={0.88} displacementScale={0.12} normalScale={pavingNormalScale} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-13.5, -0.44, -9]} receiveShadow>
      <circleGeometry args={[11, mobile ? 56 : 72]} />
      <meshStandardMaterial {...ground} color="#4d5945" roughness={1} normalScale={groundNormalScale} />
    </mesh>
  </group>;
}

function Villa({ mobile }: { mobile: boolean }) {
  const { scene } = useGLTF(`${MODEL_ROOT}${mobile ? "villa-mobile.glb" : "villa.glb"}`);
  const suffix = mobile ? "-mobile" : "";
  const concrete = useTexture({
    normalMap: `/experience/textures/concrete_wall_009_nor_gl${suffix}.jpg`,
    roughnessMap: `/experience/textures/concrete_wall_009_Rough${suffix}.jpg`,
  });
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    Object.values(concrete).forEach((texture) => configureTexture(texture, [3.2, 3.2], false, mobile));
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const source = object.material as THREE.MeshStandardMaterial;
      const name = source?.name || object.name;

      if (/Glass/i.test(name)) {
        object.material = new THREE.MeshPhysicalMaterial({ name, color: "#799095", roughness: 0.1, metalness: 0.04, transmission: 0.42, thickness: 0.22, ior: 1.48, transparent: true, opacity: 0.7, depthWrite: false, envMapIntensity: 2.25 });
        return;
      }
      if (/01_-_Default/i.test(name)) {
        object.material = new THREE.MeshPhysicalMaterial({ name, color: "#316e73", roughness: 0.075, metalness: 0.08, transmission: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.82, envMapIntensity: 2.4 });
        return;
      }

      const material = source.clone();
      material.envMapIntensity = 1.45;
      material.roughness = THREE.MathUtils.clamp(material.roughness ?? 0.7, 0.22, 0.86);
      if (/Wall|Ceramic|06_-_Default|04_-_Default/i.test(name)) {
        material.normalMap = concrete.normalMap;
        material.roughnessMap = concrete.roughnessMap;
        material.normalScale.set(0.24, 0.24);
        material.roughness = 0.7;
      }
      if (/Metal|Aluminum|Copper/i.test(name)) {
        material.metalness = 0.72;
        material.roughness = 0.23;
        material.envMapIntensity = 2;
      }
      object.material = material;
    });

    return () => {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
    };
  }, [concrete, mobile, model]);

  return <primitive object={model} dispose={null} scale={0.46} position={[1.35, 0, -0.7]} rotation={[0, -0.16, 0]} />;
}

function cloneAt(scene: THREE.Group, placement: Placement) {
  const [x, y, z, scale, rotation] = placement;
  const object = scene.clone(true);
  object.position.set(x, y, z);
  object.scale.setScalar(scale);
  object.rotation.set(0, rotation, 0);
  return object;
}

function Landscaping({ mobile }: { mobile: boolean }) {
  const suffix = mobile ? "-mobile" : "";
  const tree = useGLTF(`${MODEL_ROOT}quiver-tree${suffix}.glb`).scene;
  const shrub = useGLTF(`${MODEL_ROOT}shrub${suffix}.glb`).scene;
  const fern = useGLTF(`${MODEL_ROOT}fern${suffix}.glb`).scene;
  const treePlacements = useMemo<Placement[]>(() => mobile ? [[-8.8, -0.45, -10.5, 3.1, 0.3]] : [[-10.8, -0.45, -10.5, 3.45, 0.3], [12.5, -0.52, -12.2, 2.95, -0.9], [-15.8, -0.55, 5.5, 2.5, 1.2]], [mobile]);
  const shrubPlacements = useMemo<Placement[]>(() => [[-8.6, -0.35, 8.2, 2.45, 0.15], [9.6, -0.4, 8.8, 2.15, -0.6], [-10.5, -0.45, -4.8, 2.7, 0.6], [12.2, -0.45, -4.5, 2.3, -0.2], [-5.5, -0.35, 12.2, 1.8, 1.1], [7.4, -0.38, 12.6, 1.9, -1]], []);
  const fernPlacements = useMemo<Placement[]>(() => mobile ? [[-5.5, -0.45, 9.2, 2.2, 0.4]] : [[-6.2, -0.45, 10.4, 2.6, 0.4], [-3.4, -0.42, 12.2, 2, -0.8], [7.8, -0.45, 10.1, 2.3, 1.3], [10.2, -0.5, 6.5, 2.8, -0.2]], [mobile]);
  const trees = useMemo(() => treePlacements.map((placement) => cloneAt(tree, placement)), [tree, treePlacements]);
  const shrubs = useMemo(() => shrubPlacements.map((placement) => cloneAt(shrub, placement)), [shrub, shrubPlacements]);
  const ferns = useMemo(() => fernPlacements.map((placement) => cloneAt(fern, placement)), [fern, fernPlacements]);

  return <group dispose={null}>
    {trees.map((object, index) => <primitive key={`tree-${index}`} object={object} dispose={null} />)}
    {shrubs.map((object, index) => <primitive key={`shrub-${index}`} object={object} dispose={null} />)}
    {ferns.map((object, index) => <primitive key={`fern-${index}`} object={object} dispose={null} />)}
  </group>;
}

function CinematicCamera({ progress, mobile }: Pick<Props, "progress" | "mobile">) {
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera);
  const filtered = useRef(0);
  const lookMatrix = useMemo(() => new THREE.Matrix4(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const cameraPath = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(mobile ? 20 : 22, mobile ? 8.6 : 7.8, mobile ? 31 : 28),
    new THREE.Vector3(15.5, 5.2, 19), new THREE.Vector3(17.5, 3.4, 5.5),
    new THREE.Vector3(9, 2.65, -10.5), new THREE.Vector3(-6.5, 4.3, -16.5),
    new THREE.Vector3(-18, 6.5, -4.5), new THREE.Vector3(-16, 5.7, 14),
  ], false, "catmullrom", 0.34), [mobile]);
  const targetPath = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.1, 0), new THREE.Vector3(0.5, 1.8, 0),
    new THREE.Vector3(-1.5, 1.4, 0.5), new THREE.Vector3(-2, 1.65, -1.5),
    new THREE.Vector3(0.5, 2.8, -2), new THREE.Vector3(2.5, 2.3, 0),
    new THREE.Vector3(0, 1.6, 1.5),
  ], false, "catmullrom", 0.36), []);
  const nextPosition = useMemo(() => new THREE.Vector3(), []);
  const nextTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    filtered.current = THREE.MathUtils.damp(filtered.current, progress.current, 3.4, delta);
    const t = THREE.MathUtils.smootherstep(filtered.current, 0, 1);
    cameraPath.getPointAt(t, nextPosition);
    targetPath.getPointAt(t, nextTarget);
    camera.position.lerp(nextPosition, 1 - Math.exp(-delta * 4.2));
    lookMatrix.lookAt(camera.position, nextTarget, camera.up);
    targetQuaternion.setFromRotationMatrix(lookMatrix);
    camera.quaternion.slerp(targetQuaternion, 1 - Math.exp(-delta * 4.8));
    camera.fov = THREE.MathUtils.damp(camera.fov, mobile ? 50 : 39 + Math.sin(t * Math.PI) * 2.5, 3, delta);
    camera.updateProjectionMatrix();
  });
  return null;
}

function RenderResumer({ visible }: Pick<Props, "visible">) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => { if (visible) invalidate(); }, [invalidate, visible]);
  return null;
}

function FirstRenderedFrame({ recoveryEpoch, onReady }: Pick<Props, "recoveryEpoch" | "onReady">) {
  const gl = useThree((state) => state.gl);
  const initialFrame = useRef(gl.info.render.frame);
  const reported = useRef(false);
  const scheduled = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    initialFrame.current = gl.info.render.frame;
    reported.current = false;
    scheduled.current = false;
    cancelAnimationFrame(raf.current);
  }, [gl, recoveryEpoch]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useFrame(() => {
    if (reported.current || scheduled.current) return;
    scheduled.current = true;
    raf.current = requestAnimationFrame(() => {
      scheduled.current = false;
      const context = gl.getContext();
      if (!context.isContextLost() && gl.info.render.frame > initialFrame.current && gl.info.render.calls > 0) {
        reported.current = true;
        onReady();
      }
    });
  });
  return null;
}

function RuntimeDpr({ mobile, balanced }: { mobile: boolean; balanced: boolean }) {
  const setDpr = useThree((state) => state.setDpr);
  useEffect(() => {
    const nativeDpr = window.devicePixelRatio || 1;
    setDpr(mobile ? Math.min(nativeDpr, balanced ? 1.1 : 1.35) : Math.min(nativeDpr, balanced ? 1.5 : 2));
  }, [balanced, mobile, setDpr]);
  return null;
}

function Scene(props: Props) {
  const [balanced, setBalanced] = useState(false);
  const [landscapingReady, setLandscapingReady] = useState(!props.mobile);
  const [contactReady, setContactReady] = useState(!props.mobile);
  const timers = useRef<number[]>([]);
  const handleFirstFrame = useCallback(() => {
    props.onReady();
    if (props.mobile && !landscapingReady) {
      timers.current.push(window.setTimeout(() => setLandscapingReady(true), 120));
      timers.current.push(window.setTimeout(() => setContactReady(true), 520));
    }
  }, [landscapingReady, props.mobile, props.onReady]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return <>
    <PerformanceMonitor flipflops={1} onDecline={() => setBalanced(true)} />
    <RuntimeDpr mobile={props.mobile} balanced={balanced} />
    <Environment files={props.mobile ? "/experience/environment/eilenriede_park_1k.hdr" : "/experience/environment/eilenriede_park_2k.hdr"} background backgroundBlurriness={0.18} environmentIntensity={1.08} backgroundIntensity={0.82} environmentRotation={[0, 1.08, 0]} backgroundRotation={[0, 1.08, 0]} />
    <hemisphereLight args={["#dce3df", "#3f4535", 1.25]} />
    <directionalLight position={[18, 25, 13]} color="#ffdec0" intensity={3.25} castShadow shadow-mapSize={props.mobile || balanced ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-24} shadow-camera-right={24} shadow-camera-top={24} shadow-camera-bottom={-24} shadow-bias={-0.00018} />
    <pointLight position={[-3.6, 2.15, 3.8]} color="#ffc784" intensity={44} distance={10} decay={2.2} />
    <pointLight position={[5.4, 2.8, -1.8]} color="#ffd7a3" intensity={36} distance={9} decay={2.2} />
    <PbrLandscape mobile={props.mobile} />
    <Villa mobile={props.mobile} />
    {landscapingReady && <Suspense fallback={null}><Landscaping mobile={props.mobile} /></Suspense>}
    {contactReady && <ContactShadows position={[0, -0.48, 0]} opacity={0.42} scale={40} blur={2.6} far={18} resolution={props.mobile ? 512 : 1024} frames={1} />}
    <CinematicCamera progress={props.progress} mobile={props.mobile} />
    <RenderResumer visible={props.visible} />
    <FirstRenderedFrame recoveryEpoch={props.recoveryEpoch} onReady={handleFirstFrame} />
    <fog attach="fog" args={["#aeb0a3", 30, 72]} />
    {!props.mobile && <EffectComposer multisampling={4}><Bloom mipmapBlur intensity={0.22} luminanceThreshold={1.18} luminanceSmoothing={0.28} /><Vignette eskil={false} offset={0.22} darkness={0.34} /></EffectComposer>}
  </>;
}

export default function ArchitecturalScene(props: Props) {
  return <Canvas
    className="experience-canvas"
    dpr={props.mobile ? [1, 1.35] : [1.25, 2]}
    frameloop={props.visible ? "always" : "never"}
    resize={{ scroll: false, debounce: { scroll: 0, resize: 140 } }}
    gl={{ antialias: true, powerPreference: "high-performance", alpha: false, depth: true, stencil: false, preserveDrawingBuffer: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    camera={{ position: [22, 7.8, 28], fov: props.mobile ? 50 : 39, near: 0.1, far: 120 }}
    shadows="soft"
    fallback={<div className="webgl-fallback" role="img" aria-label="Zeitgenössische Residenz in natürlicher Umgebung" />}
    onCreated={({ gl }) => {
      gl.outputColorSpace = THREE.SRGBColorSpace;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      if (gl.getContext().isContextLost()) throw new Error("WebGL context unavailable during renderer initialization");
      gl.domElement.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        props.onContextLost();
      }, false);
      gl.domElement.addEventListener("webglcontextrestored", props.onContextRestored, false);
      props.onRendererCreated();
    }}
  ><Scene {...props} /></Canvas>;
}
