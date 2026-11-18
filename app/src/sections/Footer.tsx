import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Github, Linkedin, Mail, Send } from 'lucide-react';

export default function Footer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const { theme } = useTheme();

  const getAccentColor = useCallback(() => {
    switch (theme) {
      case 'light':
        return [1.0, 0.0, 0.0];
      case 'vibrant':
        return [0.0, 0.0, 0.0];
      default:
        return [1.0, 0.0, 0.0];
    }
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) return;

    // Vertex shader
    const vertSrc = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Threshold pass fragment shader
    const fragThresholdSrc = `
      precision mediump float;
      uniform vec2 uResolution;
      uniform vec2 uBalls[6];
      uniform float uTime;

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution;
        float f = 0.0;
        for (int i = 0; i < 6; i++) {
          vec2 center = uBalls[i];
          float radius = 0.15 + 0.05 * sin(uTime * 0.5 + float(i));
          float d = distance(st, center);
          f += radius / d;
        }
        gl_FragColor = vec4(f, f, f, 1.0);
      }
    `;

    // Color pass fragment shader
    const fragColorSrc = `
      precision mediump float;
      uniform vec2 uResolution;
      uniform sampler2D uTexture;
      uniform vec3 uAccentColor;

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution;
        vec4 texColor = texture2D(uTexture, st);
        float f = texColor.r;
        float threshold = 0.48;
        float gooey = smoothstep(threshold - 0.02, threshold + 0.02, f);
        float edgeDist = abs(f - threshold);
        float edgeGlow = 1.0 - smoothstep(0.0, 0.08, edgeDist);
        vec3 edgeColor = mix(vec3(1.0), uAccentColor, 0.8);
        vec3 finalColor = mix(uAccentColor, edgeColor, edgeGlow * 0.6);
        gl_FragColor = vec4(finalColor, gooey);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      return program;
    }

    // Full-screen quad
    const quadGeo = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quadGeo, gl.STATIC_DRAW);

    // Threshold program
    const vs1 = createShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fs1 = createShader(gl, gl.FRAGMENT_SHADER, fragThresholdSrc);
    const progThreshold = createProgram(gl, vs1!, fs1!);

    // Color program
    const vs2 = createShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fs2 = createShader(gl, gl.FRAGMENT_SHADER, fragColorSrc);
    const progColor = createProgram(gl, vs2!, fs2!);

    // Framebuffer for threshold pass
    const fb = gl.createFramebuffer();
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    };
    resize();
    window.addEventListener('resize', resize);

    // Ball positions
    const balls = Array.from({ length: 6 }, (_, i) => ({
      baseX: 0.2 + (i % 3) * 0.3,
      baseY: 0.2 + Math.floor(i / 3) * 0.5,
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      const accent = getAccentColor();

      // Update ball positions
      const ballPositions: number[] = [];
      balls.forEach((ball) => {
        const x = ball.baseX + Math.sin(time * ball.speed + ball.phase) * 0.15;
        const y = ball.baseY + Math.cos(time * ball.speed * 0.7 + ball.phase) * 0.12;
        ballPositions.push(x, y);
      });

      // Pass 1: Render threshold to framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(progThreshold);
      const aPos1 = gl.getAttribLocation(progThreshold, 'aPosition');
      gl.enableVertexAttribArray(aPos1);
      gl.vertexAttribPointer(aPos1, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(gl.getUniformLocation(progThreshold, 'uResolution'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(progThreshold, 'uTime'), time);
      for (let i = 0; i < 6; i++) {
        gl.uniform2f(gl.getUniformLocation(progThreshold, `uBalls[${i}]`), ballPositions[i * 2], ballPositions[i * 2 + 1]);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Pass 2: Render color to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(progColor);
      const aPos2 = gl.getAttribLocation(progColor, 'aPosition');
      gl.enableVertexAttribArray(aPos2);
      gl.vertexAttribPointer(aPos2, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(gl.getUniformLocation(progColor, 'uResolution'), canvas.width, canvas.height);
      gl.uniform3f(gl.getUniformLocation(progColor, 'uAccentColor'), accent[0], accent[1], accent[2]);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(gl.getUniformLocation(progColor, 'uTexture'), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disable(gl.BLEND);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(progThreshold);
      gl.deleteProgram(progColor);
      gl.deleteFramebuffer(fb);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
    };
  }, [getAccentColor]);

  return (
    <section
      id="contact"
      className="relative z-20 min-h-screen flex items-center"
      style={{
        backgroundColor: 'var(--bg)',
      }}
    >
      {/* Plasma background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.6,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 w-full px-6 md:px-10 py-20"
        style={{ padding: '10vh 2.5vw' }}
      >
        <div className="max-w-7xl mx-auto">
          <h2
            className="font-bold leading-none tracking-tight mb-16 theme-transition"
            style={{
              fontSize: 'clamp(36px, 6vw, 80px)',
              color: 'var(--text)',
            }}
          >
            LET'S BUILD THE
            <br />
            NEXT BIG THING.
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div
              className="p-8 rounded-lg theme-transition"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--text-muted)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex flex-col gap-6">
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2 theme-transition"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg outline-none theme-transition"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text)',
                      border: '1px solid var(--text-muted)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2 theme-transition"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg outline-none theme-transition"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text)',
                      border: '1px solid var(--text-muted)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2 theme-transition"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell me about your project..."
                    className="w-full px-4 py-3 rounded-lg outline-none resize-none theme-transition"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text)',
                      border: '1px solid var(--text-muted)',
                    }}
                  />
                </div>
                <button
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-full theme-transition hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: theme === 'light' ? '#ffffff' : 'var(--bg)',
                  }}
                >
                  SEND SIGNAL
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col justify-between">
              <div>
                <p
                  className="text-sm font-medium uppercase tracking-widest mb-6 theme-transition"
                  style={{ color: 'var(--accent)' }}
                >
                  Connect
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: Mail, label: 'ananthananth1808@gmail.com', href: 'mailto:ananthananth1808@gmail.com' },
                    { icon: Github, label: 'https://github.com/ananthananth1808-maker', href: '#' },
                    { icon: Linkedin, label: 'linkedin.com/in/ananthananth1808', href: '#' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center gap-3 group theme-transition"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <link.icon className="w-5 h-5 theme-transition group-hover:scale-110" />
                      <span className="text-lg theme-transition group-hover:underline">
                        {link.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-12">
                <p
                  className="text-xs theme-transition"
                  style={{ color: 'var(--text-muted)' }}
                >
                  &copy; 2026 ANANTH A. Built with React, Three.js & passion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
