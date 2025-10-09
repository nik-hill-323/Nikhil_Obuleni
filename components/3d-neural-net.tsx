"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, Line } from "@react-three/drei"
import { useRef, useMemo } from "react"
import type * as THREE from "three"

function NetworkNode({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <Sphere ref={meshRef} args={[0.1, 16, 16]} position={position}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </Sphere>
  )
}

function NeuralNetworkViz() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  const layers = useMemo(() => {
    return [
      { nodes: 4, x: -2, color: "#06b6d4" },
      { nodes: 6, x: 0, color: "#8b5cf6" },
      { nodes: 4, x: 2, color: "#06b6d4" },
    ]
  }, [])

  const connections = useMemo(() => {
    const lines: Array<{ start: [number, number, number]; end: [number, number, number] }> = []
    for (let i = 0; i < layers.length - 1; i++) {
      const currentLayer = layers[i]
      const nextLayer = layers[i + 1]
      for (let j = 0; j < currentLayer.nodes; j++) {
        for (let k = 0; k < nextLayer.nodes; k++) {
          const startY = (j - (currentLayer.nodes - 1) / 2) * 0.5
          const endY = (k - (nextLayer.nodes - 1) / 2) * 0.5
          lines.push({
            start: [currentLayer.x, startY, 0],
            end: [nextLayer.x, endY, 0],
          })
        }
      }
    }
    return lines
  }, [layers])

  return (
    <group ref={groupRef}>
      {layers.map((layer, layerIndex) =>
        Array.from({ length: layer.nodes }).map((_, nodeIndex) => {
          const y = (nodeIndex - (layer.nodes - 1) / 2) * 0.5
          return <NetworkNode key={`${layerIndex}-${nodeIndex}`} position={[layer.x, y, 0]} color={layer.color} />
        }),
      )}
      {connections.map((conn, i) => (
        <Line key={i} points={[conn.start, conn.end]} color="#ffffff" lineWidth={0.5} transparent opacity={0.2} />
      ))}
    </group>
  )
}

export function NeuralNet3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
        <NeuralNetworkViz />
      </Canvas>
    </div>
  )
}
