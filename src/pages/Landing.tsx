import { Header } from "@/sections/landing/Header";
import { Hero } from "@/sections/landing/Hero";
import { Features } from "@/sections/landing/Features";
import { HowItWorks } from "@/sections/landing/HowItWorks";
import { TechnicalInsight } from "@/sections/landing/TechnicalInsight";
import { Workflow } from "@/sections/landing/Workflow";
import { UseCases } from "@/sections/landing/UseCases";
import { Preview } from "@/sections/landing/Preview";
import { Security } from "@/sections/landing/Security";
import { FAQ } from "@/sections/landing/FAQ";
import { CTA } from "@/sections/landing/CTA";
import { Footer } from "@/sections/landing/Footer";

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <TechnicalInsight />
      <Workflow />
      <UseCases />
      <Preview />
      <Security />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
