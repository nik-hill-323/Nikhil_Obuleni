"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type * as THREE from "three"

function RotatingChart() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  const bars = [
    { height: 2, color: "#06b6d4", position: [-1.5, 0, 0] },
    { height: 3, color: "#8b5cf6", position: [-0.5, 0, 0] },
    { height: 1.5, color: "#06b6d4", position: [0.5, 0, 0] },
    { height: 2.5, color: "#8b5cf6", position: [1.5, 0, 0] },
  ]

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => (
        <mesh key={i} position={[bar.position[0], bar.height / 2, bar.position[2]]}>
          <boxGeometry args={[0.4, bar.height, 0.4]} />
          <meshStandardMaterial color={bar.color} emissive={bar.color} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function DataViz3D() {
  return (
    <div className="w-full h-64">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <RotatingChart />
      </Canvas>
    </div>
  )
}
