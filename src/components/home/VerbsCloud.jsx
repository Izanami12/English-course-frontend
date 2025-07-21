import * as THREE from 'three';
import { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, Text, TrackballControls } from '@react-three/drei';
import IrregularVerbService from '../service/IrregularVerbService';
import './VerbsCloud.css'; // Import the CSS file

const VerbsCloud = () => {
  const [verbs, setVerbs] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await IrregularVerbService.getIrregularVerbList();
        const verbs = response.data.data.slice(0,100).map((item) => item.infinitive);
        setVerbs(verbs);
      } catch (error) {
        console.error('Error fetching verbs:', error);
      }
    };

    fetchData();
  }, []);

  const Word = ({ children, position }) => {
    const color = new THREE.Color();
    const ref = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame(({ camera }) => {
      ref.current.material.color.lerp(color.set(hovered ? '#fa2720' : 'white'), 0.1);
    });

    return (
      <Billboard position={position}>
        <Text
          ref={ref}
          fontSize={0.5}
          color={hovered ? '#fa2720' : 'white'}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => console.log('clicked:', children)}
        >
          {children}
        </Text>
      </Billboard>
    );
  };

  const Cloud = ({ count = 50, radius = 10 }) => {
    const words = useMemo(() => {
      const temp = [];
      const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle increment

      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y) * radius; // Radius at y
        const theta = phi * i; // Golden angle increment

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        temp.push({ x, y: y * radius, z, word: verbs[i % verbs.length] || 'Loading...' });
      }

      return temp;
    }, [count, radius, verbs]);

    return words.map(({ x, y, z, word }, index) => (
      <Word key={index} position={[x, y, z]} children={word} />
    ));
  };

  return (
    <div className="verbs-cloud-wrapper">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 20], fov: 90 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Suspense fallback={null}>
          <Cloud count={verbs.length} radius={10} />
        </Suspense>
        <TrackballControls />
      </Canvas>
    </div>
  );
};

export default VerbsCloud;