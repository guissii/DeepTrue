import { useTranslation } from "react-i18next";
import { ScanFace, FileText, Shield, Zap, Lock, FileSearch, Globe, Smartphone, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Deepfake Detection",
    description: "Our core engine analyzes video and audio streams in real-time. Using Gemini 1.5 Pro, we detect subtle artifacts invisible to the human eye.",
    icon: ScanFace,
    color: "text-blue-500",
    shadowColor: "rgba(59, 130, 246, 0.5)", // Blue
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
  },
  {
    title: "Document Forensics",
    description: "Automated scanning of invoices and contracts to detect pixel-level alterations and font inconsistencies.",
    icon: FileText,
    color: "text-green-500",
    shadowColor: "rgba(34, 197, 94, 0.5)", // Green
    gradient: "from-green-500/20 via-green-500/5 to-transparent",
  },
  {
    title: "Real-time Scoring",
    description: "Get instant risk scores. Our edge-first architecture ensures low latency for critical verifications.",
    icon: Zap,
    color: "text-yellow-500",
    shadowColor: "rgba(234, 179, 8, 0.5)", // Yellow
    gradient: "from-yellow-500/20 via-yellow-500/5 to-transparent",
  },
  {
    title: "Global Intelligence",
    description: "Cross-reference artifacts against a global database of known deepfake patterns and synthetic media signatures.",
    icon: Globe,
    color: "text-purple-500",
    shadowColor: "rgba(168, 85, 247, 0.5)", // Purple
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption and SOC2 compliant infrastructure ensuring your data remains private and secure.",
    icon: Shield,
    color: "text-red-500",
    shadowColor: "rgba(239, 68, 68, 0.5)", // Red
    gradient: "from-red-500/20 via-red-500/5 to-transparent",
  },
  {
    title: "Mobile SDK",
    description: "Integrate deepfake detection directly into your mobile applications with our lightweight React Native SDK.",
    icon: Smartphone,
    color: "text-cyan-500",
    shadowColor: "rgba(6, 182, 212, 0.5)", // Cyan
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
  },
];

export function Features() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden" id="features">
       {/* Ambient Background Glow */}
       <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
       <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
           <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
             Enterprise-Grade Protection
           </h2>
           <p className="text-lg text-muted-foreground">
             Advanced tools built for security teams who refuse to compromise on trust.
           </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="group relative h-full bg-background/50 backdrop-blur-sm border-border/50 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-transparent"
                style={{
                  // Dynamic shadow variable for hover state
                  ['--shadow-color' as any]: feature.shadowColor
                }}
              >
                {/* Reactive Glow Effect */}
                <div 
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    feature.gradient
                  )} 
                />
                
                {/* Glow Spot */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="relative z-10">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-background/80 border border-border shadow-sm transition-colors duration-300 group-hover:bg-transparent group-hover:border-white/20")}>
                    <feature.icon className={cn("w-6 h-6 transition-colors duration-300", feature.color)} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-foreground transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base group-hover:text-muted-foreground/80 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Animated Bottom Border */}
                <div 
                   className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 w-full translate-x-[-100%] group-hover:translate-x-0"
                   style={{ color: feature.shadowColor }}
                />
                
                {/* Reactive Shadow (Box Shadow) */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `0 0 40px -10px ${feature.shadowColor}`
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
