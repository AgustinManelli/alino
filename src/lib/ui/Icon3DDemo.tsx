"use client";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { GLTF } from "three-stdlib";
import * as THREE from "three";
import { motion } from "framer-motion-3d";

type GLTFResult = GLTF & {
  nodes: {
    Curve: THREE.Mesh;
  };
  materials: {
    SVGMat: THREE.MeshStandardMaterial;
  };
};

const lights = [
  [2, 1, 4, 1],
  [8, 0, 4, 1],
];

export function Icon3DDemo(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/ArrowIcon.glb") as GLTFResult;

  return (
    <Canvas
      resize={{ offsetSize: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.5], fov: 45 }}
    >
      {lights.map(([x, y, z, intensity], i) => (
        <pointLight
          key={i}
          intensity={intensity}
          position={[x / 8, y / 8, z / 8]}
          color="#fff"
        />
      ))}
      <group dispose={null}>
        <motion.mesh
          castShadow
          receiveShadow
          geometry={nodes.Curve.geometry}
          material={materials.SVGMat}
          position={[-1.515, -1.691, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[100, 0, 100]}
          animate={"unliked"}
          variants={{
            unliked: {
              x: -1.512,
              y: -1.691,
              rotateZ: 0,
              transition: {
                rotateZ: { duration: 1.5, ease: "linear", repeat: Infinity },
              },
            },
            liked: {
              x: 4,
              y: [0, -1.5, 2],
              scale: 0.9,
              transition: { duration: 0.5 },
            },
            hover: {
              rotateZ: 0,
              rotateY: 0.3,
              transition: {
                rotateZ: { duration: 1.5, ease: "linear", repeat: Infinity },
              },
            },
          }}
        >
          <meshPhongMaterial
            color="#87189d"
            emissive="#87189d"
            specular="#fff"
            shininess={100}
          />
        </motion.mesh>
      </group>
    </Canvas>
  );
}

useGLTF.preload("/ArrowIcon.glb");
