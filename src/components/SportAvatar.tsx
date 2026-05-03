 // 🎨 aplicar preto e branco
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()

        // remove saturação
        child.material.color = new THREE.Color(0.9, 0.9, 0.9)

        // opcional: deixa mais "premium"
        child.material.roughness = 0.6
        child.material.metalness = 0.1
      }
    })
  }, [scene])

  return <primitive ref={group} object={scene} scale={2} />
}

export default function Avatar({ animation }) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 3] }}
      style={{ height: 500 }}
    >
      {/* iluminação cinematográfica */}
      <ambientLight intensity={0.4} />

      <directionalLight
        position={[2, 3, 2]}
        intensity={1.2}
      />

      <spotLight
        position={[0, 5, 5]}
        angle={0.3}
        intensity={1.5}
        penumbra={1}
      />

      <AvatarModel animation={animation} />
    </Canvas>
  )
}

useGLTF.preload('/assets/avatar.glb')
