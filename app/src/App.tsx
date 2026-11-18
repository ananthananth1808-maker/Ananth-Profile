import { ThemeProvider } from './context/ThemeContext';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import Profile from './sections/Profile';
import TechRadar from './sections/TechRadar';
import Projects from './sections/Projects';
import Footer from './sections/Footer';

export default function App() {
  return (
    <ThemeProvider>
      <div className="relative">
        <Navigation />
        <Hero />
        <Profile />
        <TechRadar />
        <Projects />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
