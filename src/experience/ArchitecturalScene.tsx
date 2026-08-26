import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, useGLTF, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Component, ErrorInfo, MutableRefObject, ReactNode, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  progress: MutableRefObject<number>;
  mobile: boolean;
  visible: boolean;
  onRendererCreated: () => void;
  onSceneMounted: () => void;
  onReady: () => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  onOptionalAssetError: (message: string) => void;
};

type Placement = [number, number, number, number, number];

const MODEL_ROOT = "/experience/models/";
const POLYHAVEN_ROOT = "https://dl.polyhaven.org/file/ph-assets";
const TEXTURE_ROOT = `${POLYHAVEN_ROOT}/Textures/jpg/1k`;
const HDR_ROOT = `${POLYHAVEN_ROOT}/HDRIs/hdr`;

function configureTexture(texture: THREE.Texture, repeat: [number, number], color = false, mobile = false) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = mobile ? 4 : 8;
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
}

function PbrLandscape({ mobile }: { mobile: boolean }) {
  const ground = useTexture({
    map: `${TEXTURE_ROOT}/aerial_grass_rock/aerial_grass_rock_diff_1k.jpg`,
    normalMap: `${TEXTURE_ROOT}/aerial_grass_rock/aerial_grass_rock_nor_gl_1k.jpg`,
    roughnessMap: `${TEXTURE_ROOT}/aerial_grass_rock/aerial_grass_rock_rough_1k.jpg`,
    displacementMap: `${TEXTURE_ROOT}/aerial_grass_rock/aerial_grass_rock_disp_1k.jpg`,
  });
  const paving = useTexture({
    map: `${TEXTURE_ROOT}/concrete_pavement_02/concrete_pavement_02_diff_1k.jpg`,
    normalMap: `${TEXTURE_ROOT}/concrete_pavement_02/concrete_pavement_02_nor_gl_1k.jpg`,
    roughnessMap: `${TEXTURE_ROOT}/concrete_pavement_02/concrete_pavement_02_rough_1k.jpg`,
    displacementMap: `${TEXTURE_ROOT}/concrete_pavement_02/concrete_pavement_02_disp_1k.jpg`,
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
  // The post-50aa mobile derivative is below the previous asset-transfer ceiling and
  // preserves the complete villa geometry/material structure. Using the verified
  // derivative on both profiles avoids the damaged capped desktop GLB without changing
  // the authored scene composition.
  const { scene } = useGLTF(`${MODEL_ROOT}villa-mobile.glb`);
  const concrete = useTexture({
    normalMap: `${TEXTURE_ROOT}/concrete_wall_009/concrete_wall_009_nor_gl_1k.jpg`,
    roughnessMap: `${TEXTURE_ROOT}/concrete_wall_009/concrete_wall_009_rough_1k.jpg`,
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

function Landscaping() {
  // These derivatives keep the same authored plants while avoiding the capped originals.
  const tree = useGLTF(`${MODEL_ROOT}quiver-tree-mobile.glb`).scene;
  const shrub = useGLTF(`${MODEL_ROOT}shrub-mobile.glb`).scene;
  const fern = useGLTF(`${MODEL_ROOT}fern-mobile.glb`).scene;
  const treePlacements = useMemo<Placement[]>(() => [[-10.8, -0.45, -10.5, 3.45, 0.3], [12.5, -0.52, -12.2, 2.95, -0.9], [-15.8, -0.55, 5.5, 2.5, 1.2]], []);
  const shrubPlacements = useMemo<Placement[]>(() => [[-8.6, -0.35, 8.2, 2.45, 0.15], [9.6, -0.4, 8.8, 2.15, -0.6], [-10.5, -0.45, -4.8, 2.7, 0.6], [12.2, -0.45, -4.5, 2.3, -0.2], [-5.5, -0.35, 12.2, 1.8, 1.1], [7.4, -0.38, 12.6, 1.9, -1]], []);
  const fernPlacements = useMemo<Placement[]>(() => [[-6.2, -0.45, 10.4, 2.6, 0.4], [-3.4, -0.42, 12.2, 2, -0.8], [7.8, -0.45, 10.1, 2.3, 1.3], [10.2, -0.5, 6.5, 2.8, -0.2]], []);
  const trees = useMemo(() => treePlacements.map((placement) => cloneAt(tree, placement)), [tree, treePlacements]);
  const shrubs = useMemo(() => shrubPlacements.map((placement) => cloneAt(shrub, placement)), [shrub, shrubPlacements]);
  const ferns = useMemo(() => fernPlacements.map((placement) => cloneAt(fern, placement)), [fern, fernPlacements]);

  return <group dispose={null}>
    {trees.map((object, index) => <primitive key={`tree-${index}`} object={object} dispose={null} />)}
    {shrubs.map((object, index) => <primitive key={`shrub-${index}`} object={object} dispose={null} />)}
    {ferns.map((object, index) => <primitive key={`fern-${index}`} object={object} dispose={null} />)}
  </group>;
}

class OptionalSceneBoundary extends Component<{ children: ReactNode; label: string; onError: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    const message = `${this.props.label}: ${error.message || String(error)}`;
    console.warn("Bektas optional 3D asset skipped", message);
    this.props.onError(message);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
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

function WebGLContextEvents({ onContextLost, onContextRestored }: Pick<Props, "onContextLost" | "onContextRestored">) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener("webglcontextlost", handleLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost, false);
      canvas.removeEventListener("webglcontextrestored", onContextRestored, false);
    };
  }, [gl, onContextLost, onContextRestored]);
  return null;
}

function FirstRenderedFrame({ onReady }: Pick<Props, "onReady">) {
  const gl = useThree((state) => state.gl);
  const initialFrame = useRef(gl.info.render.frame);
  const reported = useRef(false);

  useFrame(() => {
    if (reported.current) return;
    const context = gl.getContext();
    if (!context.isContextLost() && gl.info.render.frame > initialFrame.current && gl.info.render.calls > 0) {
      reported.current = true;
      onReady();
    }
  });
  return null;
}

function Scene(props: Props) {
  const [landscapingReady, setLandscapingReady] = useState(!props.mobile);
  const [contactReady, setContactReady] = useState(!props.mobile);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    props.onSceneMounted();
  }, [props.onSceneMounted]);

  const handleFirstFrame = useCallback(() => {
    props.onReady();
    if (props.mobile) {
      timers.current.push(window.setTimeout(() => setLandscapingReady(true), 180));
      timers.current.push(window.setTimeout(() => setContactReady(true), 650));
    }
  }, [props.mobile, props.onReady]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return <>
    <Environment
      files={props.mobile ? `${HDR_ROOT}/1k/eilenriede_park_1k.hdr` : `${HDR_ROOT}/2k/eilenriede_park_2k.hdr`}
      background
      backgroundBlurriness={0.18}
      environmentIntensity={1.08}
      backgroundIntensity={0.82}
      environmentRotation={[0, 1.08, 0]}
      backgroundRotation={[0, 1.08, 0]}
    />
    <hemisphereLight args={["#dce3df", "#3f4535", 1.25]} />
    <directionalLight position={[18, 25, 13]} color="#ffdec0" intensity={3.25} castShadow shadow-mapSize={props.mobile ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-24} shadow-camera-right={24} shadow-camera-top={24} shadow-camera-bottom={-24} shadow-bias={-0.00018} />
    <pointLight position={[-3.6, 2.15, 3.8]} color="#ffc784" intensity={44} distance={10} decay={2.2} />
    <pointLight position={[5.4, 2.8, -1.8]} color="#ffd7a3" intensity={36} distance={9} decay={2.2} />
    <PbrLandscape mobile={props.mobile} />
    <Villa mobile={props.mobile} />
    {landscapingReady && <OptionalSceneBoundary label="landscaping" onError={props.onOptionalAssetError}><Suspense fallback={null}><Landscaping /></Suspense></OptionalSceneBoundary>}
    {contactReady && <ContactShadows position={[0, -0.48, 0]} opacity={0.42} scale={40} blur={2.6} far={18} resolution={props.mobile ? 512 : 1024} frames={1} />}
    <CinematicCamera progress={props.progress} mobile={props.mobile} />
    <WebGLContextEvents onContextLost={props.onContextLost} onContextRestored={props.onContextRestored} />
    <FirstRenderedFrame onReady={handleFirstFrame} />
    <fog attach="fog" args={["#aeb0a3", 30, 72]} />
    {!props.mobile && <EffectComposer multisampling={4}><Bloom mipmapBlur intensity={0.22} luminanceThreshold={1.18} luminanceSmoothing={0.28} /><Vignette eskil={false} offset={0.22} darkness={0.34} /></EffectComposer>}
  </>;
}

export default function ArchitecturalScene(props: Props) {
  return <Canvas
    className="experience-canvas"
    dpr={props.mobile ? [1, 1.35] : [1.25, 2]}
    frameloop={props.visible ? "always" : "never"}
    resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
    gl={{ antialias: true, powerPreference: "high-performance", alpha: false, depth: true, stencil: false, preserveDrawingBuffer: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    camera={{ position: [22, 7.8, 28], fov: props.mobile ? 50 : 39, near: 0.1, far: 120 }}
    shadows="soft"
    fallback={<div className="webgl-fallback" role="img" aria-label="Zeitgenössische Residenz in natürlicher Umgebung" />}
    onCreated={({ gl }) => {
      gl.outputColorSpace = THREE.SRGBColorSpace;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      props.onRendererCreated();
    }}
  ><Scene {...props} /></Canvas>;
}

// Preload only the verified below-cap model derivatives. PBR/HDR assets are loaded from
// their authoritative Poly Haven CDN URLs at the same intended resolutions.
useGLTF.preload(`${MODEL_ROOT}villa-mobile.glb`);
useGLTF.preload(`${MODEL_ROOT}quiver-tree-mobile.glb`);
useGLTF.preload(`${MODEL_ROOT}shrub-mobile.glb`);
useGLTF.preload(`${MODEL_ROOT}fern-mobile.glb`);
