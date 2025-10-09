"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from "@react-three/drei"
import { useRef, useMemo } from "react"
import * as THREE from "three"

function DataParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 1000

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      const color = new THREE.Color()
      color.setHSL(0.5 + Math.random() * 0.2, 0.7, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={particles.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={particles.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={groupRef} position={[3, 0, -2]}>
      {[0, 1, 2].map((layer) => (
        <group key={layer} position={[layer * 1.5, 0, 0]}>
          {[0, 1, 2, 3].map((node) => (
            <Float key={node} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <Sphere args={[0.15, 16, 16]} position={[0, node * 0.8 - 1.2, 0]}>
                <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
              </Sphere>
            </Float>
          ))}
        </group>
      ))}
    </group>
  )
}

function AnimatedSphere() {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial color="#06b6d4" attach="material" distort={0.4} speed={2} roughness={0.2} />
      </Sphere>
    </Float>
  )
}

export function Scene3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        <AnimatedSphere />
        <DataParticles />
        <NeuralNetwork />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
