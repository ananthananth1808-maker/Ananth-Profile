import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Profile() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const image = imageRef.current;
    if (!section || !text || !image) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        image,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        text.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="profile"
      className="relative z-20 min-h-screen flex items-center theme-transition"
      style={{
        backgroundColor: 'var(--bg)',
        padding: '10vh 2.5vw',
      }}
    >
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          {/* Image */}
          <div ref={imageRef} className="relative">
            <div
              className="relative overflow-hidden rounded-lg"
              style={{
                aspectRatio: '3/4',
                maxHeight: '70vh',
              }}
            >
              <img
                src="/images/profile.jpeg"
                alt="Ananth A"
                className="w-full h-full object-cover"
                style={{
                  filter: theme === 'vibrant' ? 'brightness(0.85) contrast(1.1)' : 'none',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: theme === 'vibrant'
                    ? 'rgba(255,0,0,0.15)'
                    : 'transparent',
                  mixBlendMode: 'multiply',
                }}
              />
            </div>
          </div>

          {/* Text */}
          <div ref={textRef} className="flex flex-col gap-6">
            <p
              className="text-sm font-medium uppercase tracking-widest theme-transition"
              style={{ color: 'var(--accent)' }}
            >
              About Me
            </p>
            <h2
              className="text-2xl md:text-4xl font-semibold leading-tight theme-transition"
              style={{ color: 'var(--text)' }}
            >
              Obsessed with details, performance, and the intersection of logic and design.
            </h2>
            <p
              className="text-base md:text-lg leading-relaxed theme-transition"
              style={{ color: 'var(--text-secondary)' }}
            >
              I'm a frontend engineer passionate about bridging the gap between sophisticated
              design and high-performance code. With 7+ years of experience in React, WebGL,
              and animation libraries, I transform static mockups into living, breathing
              digital experiences.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              {['React', 'TypeScript', 'WebGL', 'Node.js', 'Three.js'].map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 text-sm font-medium rounded-full theme-transition"
                  style={{
                    backgroundColor: 'var(--card)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--text-muted)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
