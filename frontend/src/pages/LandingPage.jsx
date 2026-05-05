import { useNavigate } from "react-router-dom";
import TopNavBar from "../components/TopNavBar";
import HeroSection from "../components/HeroSection";
import ProblemSolution from "../components/ProblemSolution";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Benefits from "../components/Benefits";
import Stats from "../components/Stats";
import SecurityCompliance from "../components/SecurityCompliance";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      <TopNavBar onLoginClick={() => navigate("/login")} />
      <HeroSection onCTAClick={() => navigate("/login")} />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <Benefits />
      <Stats />
      <SecurityCompliance />
      <Testimonials />
      <FAQ />
      <FinalCTA onCTAClick={() => navigate("/login")} />
      <Footer />
    </div>
  );
}
