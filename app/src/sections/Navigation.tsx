import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';

export default function Navigation() {
  const { theme, setTheme } = useTheme();

  const themes: Theme[] = ['dark', 'light', 'vibrant'];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10"
      style={{
        height: '80px',
        background: 'transparent',
      }}
    >
      <div
        className="text-2xl font-bold tracking-tight theme-transition"
        style={{ color: 'var(--text)' }}
      >
        ANANTH.
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full theme-transition"
              style={{
                color: theme === t ? 'var(--bg)' : 'var(--text)',
                backgroundColor: theme === t ? 'var(--accent)' : 'transparent',
                border: theme === t ? 'none' : '1px solid var(--text-muted)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          className="px-5 py-2 text-sm font-semibold rounded-full theme-transition hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--accent)',
            color: theme === 'light' ? '#ffffff' : 'var(--bg)',
          }}
          onClick={() => {
            const el = document.getElementById('contact');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Let's Talk
        </button>
      </div>
    </nav>
  );
}
