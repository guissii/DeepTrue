import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-gradient-x" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Join the future of security</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Ready to Detect the Invisible?
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start protecting your organization against advanced deepfakes and financial fraud today with our AI-powered forensic platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate("/app/register")}
              className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)] transition-all hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/app/deepfake")}
              className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 transition-all hover:scale-105 backdrop-blur-sm"
            >
              View Live Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
