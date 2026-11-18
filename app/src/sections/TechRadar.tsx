import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import * as THREE from 'three';

interface TechSkill {
  name: string;
  level: number; // 0-1
}

const skills: TechSkill[] = [
  { name: 'React', level: 0.95 },
  { name: 'TypeScript', level: 0.9 },
  { name: 'Three.js', level: 0.85 },
  { name: 'Node.js', level: 0.8 },
  { name: 'WebGL', level: 0.85 },
  { name: 'Next.js', level: 0.9 },
  { name: 'GSAP', level: 0.88 },
  { name: 'Figma', level: 0.75 },
];

export default function TechRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const { theme } = useTheme();

  const getThemeColor = useCallback(() => {
    switch (theme) {
      case 'light':
        return { primary: 0x000000, secondary: 0x999999, accent: 0xff0000 };
      case 'vibrant':
        return { primary: 0xffffff, secondary: 0xffcccc, accent: 0x000000 };
      default:
        return { primary: 0xffffff, secondary: 0x646460, accent: 0xff0000 };
    }
  }, [theme]);

  const initRadar = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const aspect = width / height;
    const frustum = 5;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect,
      frustum * aspect,
      frustum,
      -frustum,
      0.1,
      100
    );
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);

    const colors = getThemeColor();
    const radarGroup = new THREE.Group();
    scene.add(radarGroup);

    const numAxes = skills.length;
    const maxRadius = 4;
    const rings = 4;

    // Create concentric rings
    for (let r = 1; r <= rings; r++) {
      const radius = (maxRadius / rings) * r;
      const ringGeo = new THREE.BufferGeometry();
      const ringPoints: number[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        ringPoints.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      }
      ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(ringPoints, 3));
      const ringMat = new THREE.LineBasicMaterial({
        color: colors.secondary,
        transparent: true,
        opacity: 0.3,
      });
      const ring = new THREE.Line(ringGeo, ringMat);
      radarGroup.add(ring);
    }

    // Create axes
    const axisGeoPoints: number[] = [];
    for (let i = 0; i < numAxes; i++) {
      const angle = (i / numAxes) * Math.PI * 2 - Math.PI / 2;
      axisGeoPoints.push(0, 0, 0);
      axisGeoPoints.push(Math.cos(angle) * maxRadius, 0, Math.sin(angle) * maxRadius);
    }
    const axisGeo = new THREE.BufferGeometry();
    axisGeo.setAttribute('position', new THREE.Float32BufferAttribute(axisGeoPoints, 3));
    const axisMat = new THREE.LineBasicMaterial({
      color: colors.secondary,
      transparent: true,
      opacity: 0.4,
    });
    const axes = new THREE.LineSegments(axisGeo, axisMat);
    radarGroup.add(axes);

    // Create data polygon
    const dataPoints: number[] = [];
    const dataIndices: number[] = [];
    for (let i = 0; i < numAxes; i++) {
      const angle = (i / numAxes) * Math.PI * 2 - Math.PI / 2;
      const radius = skills[i].level * maxRadius;
      dataPoints.push(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius);
    }
    // Add center point
    dataPoints.push(0, 0.05, 0);
    const centerIdx = numAxes;

    for (let i = 0; i < numAxes; i++) {
      const next = (i + 1) % numAxes;
      dataIndices.push(i, next, centerIdx);
    }

    const dataGeo = new THREE.BufferGeometry();
    dataGeo.setAttribute('position', new THREE.Float32BufferAttribute(dataPoints, 3));
    dataGeo.setIndex(dataIndices);
    dataGeo.computeVertexNormals();

    const dataMat = new THREE.MeshBasicMaterial({
      color: colors.accent,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const dataMesh = new THREE.Mesh(dataGeo, dataMat);
    radarGroup.add(dataMesh);

    // Data outline
    const outlinePoints: number[] = [];
    for (let i = 0; i < numAxes; i++) {
      const angle = (i / numAxes) * Math.PI * 2 - Math.PI / 2;
      const radius = skills[i].level * maxRadius;
      outlinePoints.push(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius);
    }
    outlinePoints.push(outlinePoints[0], outlinePoints[1], outlinePoints[2]);
    const outlineGeo = new THREE.BufferGeometry();
    outlineGeo.setAttribute('position', new THREE.Float32BufferAttribute(outlinePoints, 3));
    const outlineMat = new THREE.LineBasicMaterial({
      color: colors.accent,
      transparent: true,
      opacity: 0.8,
      linewidth: 2,
    });
    const outline = new THREE.Line(outlineGeo, outlineMat);
    radarGroup.add(outline);

    // Data points
    const dotGeo = new THREE.SphereGeometry(0.08, 16, 16);
    skills.forEach((_, i) => {
      const angle = (i / numAxes) * Math.PI * 2 - Math.PI / 2;
      const radius = skills[i].level * maxRadius;
      const dotMat = new THREE.MeshBasicMaterial({ color: colors.primary });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius);
      radarGroup.add(dot);
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      renderer.setSize(w, h);
      const a = w / h;
      camera.left = -frustum * a;
      camera.right = frustum * a;
      camera.top = frustum;
      camera.bottom = -frustum;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      radarGroup.rotation.y = THREE.MathUtils.lerp(
        radarGroup.rotation.y,
        mouseRef.current.x * 0.3 + time * 0.1,
        0.05
      );
      radarGroup.rotation.x = THREE.MathUtils.lerp(
        radarGroup.rotation.x,
        mouseRef.current.y * 0.2,
        0.05
      );

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [getThemeColor]);

  useEffect(() => {
    const cleanup = initRadar();
    return cleanup;
  }, [initRadar]);

  return (
    <section
      id="tech"
      className="relative z-20 min-h-screen flex flex-col items-center justify-center theme-transition"
      style={{
        backgroundColor: 'var(--bg)',
        padding: '10vh 2.5vw',
      }}
    >
      <div className="w-full max-w-7xl mx-auto">
        <p
          className="text-sm font-medium uppercase tracking-widest mb-4 theme-transition"
          style={{ color: 'var(--accent)' }}
        >
          My Digital Arsenal
        </p>
        <h2
          className="text-3xl md:text-5xl font-bold mb-12 theme-transition"
          style={{ color: 'var(--text)' }}
        >
          Tech Stack
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div ref={containerRef} className="relative" style={{ height: '500px' }}>
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="p-4 rounded-lg theme-transition"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--text-muted)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-semibold theme-transition"
                    style={{ color: 'var(--text)' }}
                  >
                    {skill.name}
                  </span>
                  <span
                    className="text-xs theme-transition"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {Math.round(skill.level * 100)}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-elevated)' }}
                >
                  <div
                    className="h-full rounded-full theme-transition"
                    style={{
                      width: `${skill.level * 100}%`,
                      backgroundColor: 'var(--accent)',
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
