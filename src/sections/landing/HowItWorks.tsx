import { motion } from "framer-motion";
import { Upload, FileSearch, ShieldCheck, FileText } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Media",
      desc: "Securely upload images, videos, or financial documents for analysis.",
    },
    {
      icon: FileSearch,
      title: "Signal Extraction",
      desc: "Our engine extracts local signals and metadata artifacts invisible to the human eye.",
    },
    {
      icon: ShieldCheck,
      title: "AI Risk Analysis",
      desc: "Gemini Core processes patterns to detect manipulation and deepfake signatures.",
    },
    {
      icon: FileText,
      title: "Detailed Report",
      desc: "Receive a comprehensive forensic report with a trust score and risk assessment.",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From upload to forensic insight in four simple, secure steps.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-background border border-primary/20 shadow-[0_0_30px_-10px_rgba(var(--primary),0.3)] flex items-center justify-center mb-6 group-hover:border-primary/50 group-hover:shadow-[0_0_50px_-10px_rgba(var(--primary),0.5)] transition-all duration-300">
                  <step.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-transparent group-hover:border-primary/10 transition-colors">
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
