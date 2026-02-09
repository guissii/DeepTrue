import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Shield } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden border-b border-border/40">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
      </div>
      
      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
        
        {/* Announcement Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium backdrop-blur-xl border border-border mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          <span className="text-muted-foreground">New: Gemini 1.5 Pro Integration</span>
          <div className="mx-2 h-4 w-[1px] bg-border" />
          <span className="text-primary cursor-pointer hover:underline">Read the docs <ArrowRight className="ml-1 h-3 w-3 inline" /></span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6"
        >
          Deepfake detection for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">
            enterprise security.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-[42rem] leading-normal mb-10 sm:text-xl sm:leading-8"
        >
          Protect your organization with local-first AI analysis. Detect manipulation in video, audio, and documents with 99.8% accuracy.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16"
        >
          <Button
            size="lg"
            onClick={() => navigate("/app/dashboard")}
            className="h-12 px-8 text-base rounded-md"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base rounded-md bg-background"
            onClick={() => window.open("https://github.com", "_blank")}
          >
            <Github className="mr-2 h-5 w-5" />
            GitHub
          </Button>
        </motion.div>

        {/* Hero Image / Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 50 }}
          className="relative w-full max-w-6xl mx-auto rounded-xl border border-border/50 bg-background/50 shadow-2xl overflow-hidden backdrop-blur-sm group"
        >
          {/* Pro Reactive Glow - Behind the dashboard */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity duration-1000 group-hover:duration-300 animate-tilt" />
          
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent z-10" />
          
          {/* Browser Window Header */}
          <div className="flex items-center px-4 py-2 border-b border-border/50 bg-muted/50">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <div className="mx-auto text-xs font-mono text-muted-foreground opacity-50">deeptrust.ai/dashboard</div>
          </div>

          {/* Fake Dashboard Content (Simplified) */}
          <div className="p-2 md:p-8 grid gap-4 md:grid-cols-3 aspect-[16/9] md:aspect-[21/9] bg-background">
            <div className="col-span-2 space-y-4">
               <div className="h-full rounded-lg border border-border bg-muted/10 p-6 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <div className="space-y-2">
                    <div className="h-5 w-1/3 bg-muted rounded" />
                    <div className="h-4 w-1/2 bg-muted/50 rounded" />
                  </div>
                  <div className="h-48 w-full bg-gradient-to-t from-primary/10 to-transparent rounded-lg mt-8 border border-primary/10 flex items-end p-4">
                     <div className="w-full flex items-end gap-2 h-full">
                        {[40, 60, 45, 70, 50, 80, 65, 85, 90, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-primary/60 rounded-t-sm hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
            <div className="col-span-1 space-y-4">
               <div className="h-1/2 rounded-lg border border-border bg-muted/10 p-4 space-y-3">
                 <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className="h-2 w-full bg-muted/30 rounded" />
                    <div className="h-2 w-full bg-muted/30 rounded" />
                    <div className="h-2 w-2/3 bg-muted/30 rounded" />
                 </div>
               </div>
               <div className="h-1/2 rounded-lg border border-border bg-muted/10 p-4 flex flex-col justify-center items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-medium">System Secure</div>
                  <div className="text-xs text-muted-foreground">0 threats detected</div>
               </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
