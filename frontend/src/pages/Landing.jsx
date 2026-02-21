import React from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import SocialProof from "../components/landing/SocialProof";
import TechStack from "../components/landing/TechStack";
import Features from "../components/landing/Features";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <TechStack />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
