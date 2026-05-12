import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import EnhancementsSection from "./components/EnhancementsSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <EnhancementsSection />
      </main>
    </>
  );
}
