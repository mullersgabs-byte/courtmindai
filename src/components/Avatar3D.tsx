import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Avatar2D } from "./Avatar2D";

type Props = {
  clipUrl: string;
  paused?: boolean;
  speed?: number;
  className?: string;
};

class ErrBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { console.warn("[Avatar3D] failed", e); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Model({ url, paused, speed = 1 }: { url: string; paused?: boolean; speed?: number }) {
  const fbx = useLoader(FBXLoader, url) as THREE.Group;
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  const cloned = useMemo(() => {
    const obj = fbx.clone(true);
    // Premium clean white material on every mesh
    obj.traverse((child) => {
      const m = child as THREE.Mesh;
      if ((m as THREE.Mesh).isMesh) {
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#FFFFFF"),
          roughness: 0.55,
          metalness: 0.05,
        });
        m.material = mat;
        m.castShadow = true;
        m.receiveShadow = false;
      }
    });

    // Auto-frame: scale + center
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetHeight = 1.7;
    const scale = targetHeight / maxDim;
    obj.scale.setScalar(scale);

    const box2 = new THREE.Box3().setFromObject(obj);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    obj.position.x -= center.x;
    obj.position.z -= center.z;
    obj.position.y -= box2.min.y; // feet on ground

    return obj;
  }, [fbx]);

  useEffect(() => {
    const mixer = new THREE.AnimationMixer(cloned);
    mixerRef.current = mixer;
    const clips = (fbx as unknown as { animations: THREE.AnimationClip[] }).animations;
    if (clips && clips.length > 0) {
      const action = mixer.clipAction(clips[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }
    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [cloned, fbx]);

  useFrame((_, delta) => {
    if (paused) return;
    mixerRef.current?.update(delta * speed);
  });

  return <primitive object={cloned} />;
}

export function Avatar3D({ clipUrl, paused, speed, className }: Props) {
  const [supported] = useState(() => typeof window !== "undefined");
  if (!supported) {
    return (
      <div className={className}>
        <Avatar2D />
      </div>
    );
  }
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ErrBoundary fallback={<div className="flex h-full w-full items-center justify-center"><Avatar2D /></div>}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 1.4, 3.2], fov: 32 }}
          gl={{ antialias: true, preserveDrawingBuffer: false }}
        >
          <color attach="background" args={["#F5F5F5"]} />
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-4, 3, -2]} intensity={0.35} color="#ffffff" />
          <Suspense fallback={null}>
            <Model url={clipUrl} paused={paused} speed={speed} />
            <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={6} blur={2.4} far={3} />
          </Suspense>
        </Canvas>
      </ErrBoundary>
    </div>
  );
}

export default Avatar3D;