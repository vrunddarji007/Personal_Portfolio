import BackgroundCanvas from '../components/BackgroundCanvas';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

function Home({ showToast }) {
  return (
    <>
      <BackgroundCanvas />
      <Navbar />
      <main>
        <Hero />
        <Skills />
        <Projects />
        <About />
        <Contact showToast={showToast} />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

export default Home;

