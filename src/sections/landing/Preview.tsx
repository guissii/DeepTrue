import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export function Preview() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((prev) => (prev < 82 ? prev + 1 : 82));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Text Content */}
          <div className="flex-1 space-y-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold leading-tight"
            >
              Real-time Risk Intelligence
              <span className="block text-primary mt-2">
                At Your Fingertips
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Our advanced dashboard provides instant visibility into deepfake threats and document anomalies. Monitor your security posture in real-time.
            </motion.p>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Analysis Speed", value: "< 2s" },
                { label: "Accuracy Rate", value: "99.8%" },
                { label: "Formats", value: "Img/Vid/Audio" },
                { label: "Privacy", value: "100% Local" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="p-4 rounded-lg bg-background/50 border border-primary/10"
                >
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fake Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-xl perspective-1000"
          >
            <div className="relative bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Dashboard Header */}
              <div className="h-12 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="ml-4 h-6 w-64 bg-primary/10 rounded-full" />
              </div>

              {/* Dashboard Body */}
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-lg">Analysis Result</h4>
                    <p className="text-sm text-muted-foreground">ID: #SCAN-8293-X</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    High Risk Detected
                  </div>
                </div>

                {/* Score Circle */}
                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/20"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-primary"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * score) / 100}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-bold">{score}</span>
                      <span className="text-xs text-muted-foreground">RISK SCORE</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Visual Artifacts</span>
                        <span className="text-red-400">Detected</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "85%" }}
                          transition={{ duration: 1 }}
                          className="h-full bg-red-500" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Audio Consistency</span>
                        <span className="text-green-400">Normal</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "95%" }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-green-500" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
