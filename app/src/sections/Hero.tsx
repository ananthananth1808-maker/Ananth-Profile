import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ChevronDown } from 'lucide-react';
import * as THREE from 'three';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const { theme } = useTheme();

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create geometric tunnel effect
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const boxes: THREE.Mesh[] = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: theme === 'vibrant' ? 0x000000 : theme === 'light' ? 0xcccccc : 0x333333,
        wireframe: true,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.3,
      });
      const box = new THREE.Mesh(geometry, material);
      box.position.x = (Math.random() - 0.5) * 15;
      box.position.y = (Math.random() - 0.5) * 15;
      box.position.z = -Math.random() * 20;
      box.rotation.x = Math.random() * Math.PI;
      box.rotation.y = Math.random() * Math.PI;
      const scale = 0.2 + Math.random() * 0.8;
      box.scale.set(scale, scale, scale);
      scene.add(box);
      boxes.push(box);
    }

    // Add some particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: theme === 'vibrant' ? 0xffffff : theme === 'light' ? 0x999999 : 0x555555,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      boxes.forEach((box) => {
        box.rotation.x += 0.002;
        box.rotation.y += 0.003;
        box.position.z += 0.02;
        if (box.position.z > 5) {
          box.position.z = -20;
        }
      });

      particles.rotation.y = time * 0.05;
      particles.rotation.x = mouseRef.current.y * 0.1;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseRef.current.x * 0.5, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseRef.current.y * 0.5, 0.05);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      boxes.forEach(b => {
        (b.material as THREE.Material).dispose();
        b.geometry.dispose();
      });
    };
  }, [theme]);

  useEffect(() => {
    const cleanup = initWebGL();
    return cleanup;
  }, [initWebGL]);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100vh' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* Overlay for text contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: theme === 'light'
            ? 'rgba(244,244,244,0.6)'
            : theme === 'vibrant'
            ? 'rgba(255,0,0,0.3)'
            : 'rgba(0,0,0,0.4)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col justify-center h-full px-6 md:px-10"
        style={{ paddingTop: '80px' }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full">
          <div className="flex-1">
            <p
              className="text-sm font-medium uppercase tracking-widest mb-4 theme-transition"
              style={{ color: 'var(--text-muted)' }}
            >
              Frontend Engineer
            </p>
            <h1
              className="font-bold leading-none tracking-tight theme-transition"
              style={{
                fontSize: 'clamp(48px, 8vw, 120px)',
                color: 'var(--text)',
              }}
            >
              ANANTH A
              <br />
            
            </h1>
            <p
              className="mt-6 text-lg md:text-xl max-w-md theme-transition"
              style={{ color: 'var(--text-secondary)' }}
            >
              Turning coffee into functional, beautiful interfaces.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8 grid grid-cols-3 items-end"
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <span className="text-sm">Scroll to discover</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
          <div className="text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            01
          </div>
          <div className="text-right text-sm" style={{ color: 'var(--text-muted)' }}>
            
          </div>
        </div>
      </div>
    </section>
  );
}
