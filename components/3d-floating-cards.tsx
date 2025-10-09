"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { RoundedBox, Text } from "@react-three/drei"
import { useRef } from "react"
import type * as THREE from "three"

function FloatingCard({ position, text, delay }: { position: [number, number, number]; text: string; delay: number }) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.3
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.2
    }
  })

  return (
    <group ref={meshRef} position={position}>
      <RoundedBox args={[1.5, 0.8, 0.1]} radius={0.05}>
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.8} />
      </RoundedBox>
      <Text position={[0, 0, 0.06]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle" maxWidth={1.3}>
        {text}
      </Text>
    </group>
  )
}

export function FloatingCards3D() {
  const cards = [
    { text: "Machine Learning", position: [-2, 0, 0] as [number, number, number], delay: 0 },
    { text: "Data Analytics", position: [0, 0.5, -0.5] as [number, number, number], delay: 1 },
    { text: "AI Solutions", position: [2, -0.3, 0] as [number, number, number], delay: 2 },
  ]

  return (
    <div className="w-full h-64">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        {cards.map((card, i) => (
          <FloatingCard key={i} position={card.position} text={card.text} delay={card.delay} />
        ))}
      </Canvas>
    </div>
  )
}
