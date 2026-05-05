import TopNavBar from "./components/TopNavBar";
import HeroSection from "./components/HeroSection";
import ProblemSolution from "./components/ProblemSolution";
import HowItWorks from "./components/HowItWorks";
import Stats from "./components/Stats";
import Certifications from "./components/Certifications";
import SecurityCompliance from "./components/SecurityCompliance";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Benefits from "./components/Benefits";
import Features from "./components/Features";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="bg-background text-on-background font-body-md antialiased">
      <TopNavBar />
      <main className="pt-20">
        <HeroSection />
        <ProblemSolution />
        <HowItWorks />
        <Stats />
        <Certifications />
        <SecurityCompliance />
        <Testimonials />
        <FAQ />
        <FinalCTA />
        <Benefits />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

export default App;
