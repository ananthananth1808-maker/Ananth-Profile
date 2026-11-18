import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  name: string;
  category: string;
  image: string;
  description: string;
  repositoryUrl: string;
}

const projects: Project[] = [
  {
    name: 'Quantx Technologies',
    category: 'FINTECH DASHBOARD',
    image: '/images/project-fintech.jpg',
    description: 'Real-time Training Platform Dashboard',
    repositoryUrl: 'https://github.com/ananthananth1808-maker/quantyx-landing-page',
  },
  {
    name: 'ParkPal Smartfind',
    category: 'WEBGL EXPERIENCE',
    image: '/images/project-visualizer.jpg',
    description: 'Real Time Locating Parking Lots in Cities',
    repositoryUrl: 'https://github.com/asabishek/parkpal-smartfind',
  },
  {
    name: 'E-Commerce App',
    category: 'E-COMMERCE APP',
    image: '/images/project-ecommerce.jpg',
    description: 'Modern mobile shopping experience',
    repositoryUrl: 'https://github.com/ananthananth1808-maker/SportSpot',
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const items = section.querySelectorAll('.project-item');
      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative z-20 theme-transition"
      style={{
        backgroundColor: 'var(--bg)',
        padding: '20vh 2.5vw',
      }}
    >
      <div className="w-full max-w-7xl mx-auto">
        <p
          className="text-sm font-medium uppercase tracking-widest mb-4 theme-transition"
          style={{ color: 'var(--accent)' }}
        >
          Portfolio
        </p>
        <h2
          className="text-3xl md:text-5xl font-bold mb-16 theme-transition"
          style={{ color: 'var(--text)' }}
        >
          Selected Works
        </h2>

        <div className="flex flex-col">
          {projects.map((project, index) => (
            <div
              key={project.name}
              className="project-item"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  borderTop: '1px solid var(--text-muted)',
                }}
              >
                {/* Hover background wipe */}
                <div
                  className="absolute inset-0 theme-transition"
                  style={{
                    backgroundColor: 'var(--accent)',
                    transform:
                      hoveredIndex === index
                        ? 'translateX(0) skewX(-5deg)'
                        : 'translateX(-110%) skewX(-5deg)',
                    transition: 'transform 0.5s cubic-bezier(0.77, 0, 0.175, 1)',
                    opacity: 0.08,
                  }}
                />

                <div className="relative z-10 flex items-center justify-between py-8 md:py-12 px-4 md:px-8 cursor-pointer group">
                  <div className="flex-1">
                    <h3
                      className="text-2xl md:text-5xl font-semibold theme-transition group-hover:shimmer-text"
                      style={{ color: 'var(--text)' }}
                    >
                      {project.name}
                    </h3>
                    <p
                      className="text-sm mt-2 theme-transition"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 md:flex-row md:items-center md:gap-8">
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.name} GitHub repository`}
                      className="flex items-center gap-2 px-3 py-2 md:px-4 text-xs md:text-sm font-medium rounded-full theme-transition"
                      style={{
                        backgroundColor: 'var(--a)',
                        color: theme === 'dark' ? 'blue' : 'var(--bg)',
                      }}
                    >
                      View Repository
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                    <span
                      className="text-xs md:text-sm font-medium uppercase tracking-wider theme-transition"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Preview image on hover */}
                <div
                  className="absolute right-24 top-1/2 -translate-y-1/2 w-64 h-40 rounded-lg overflow-hidden pointer-events-none theme-transition hidden lg:block"
                  style={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    transform:
                      hoveredIndex === index
                        ? 'translateY(-50%) scale(1)'
                        : 'translateY(-50%) scale(0.9)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                    zIndex: 0,
                  }}
                >
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              borderTop: '1px solid var(--text-muted)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
