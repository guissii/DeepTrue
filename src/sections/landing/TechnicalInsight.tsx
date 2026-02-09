import { motion } from "framer-motion";
import { Cpu, Lock, Zap, Database, Server, Code, Layers, LayoutTemplate, ShieldCheck, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TechnicalInsight() {
  const categories = {
    frontend: {
      title: "Frontend & UX",
      icon: LayoutTemplate,
      items: [
        {
          name: "React + Vite",
          desc: "Built for speed and modularity. Vite ensures instant HMR (Hot Module Replacement) while React's component-based architecture allows for scalable UI development.",
          why: "Performance & Dev Experience"
        },
        {
          name: "Tailwind CSS",
          desc: "Utility-first CSS framework enabling rapid custom designs without fighting pre-built styles. Handles our complex Dark/Light theming seamlessly.",
          why: "Rapid Styling & Theming"
        },
        {
          name: "Framer Motion",
          desc: "Powers our fluid animations and glassmorphism effects. It provides the 'premium' feel through physics-based transitions rather than simple CSS keyframes.",
          why: "Fluid Interactions"
        },
        {
          name: "Shadcn UI",
          desc: "Accessible, unstyled component primitives that give us full control over the design system while ensuring WAI-ARIA compliance.",
          why: "Accessibility & Control"
        }
      ]
    },
    backend: {
      title: "Backend & Security",
      icon: Server,
      items: [
        {
          name: "Node.js + Express",
          desc: "Event-driven, non-blocking I/O model perfect for handling multiple concurrent analysis requests without stalling the main thread.",
          why: "Scalability & Concurrency"
        },
        {
          name: "JWT & Bcrypt",
          desc: "Stateless authentication using JSON Web Tokens (JWT) for secure session management. Bcrypt adds a salt to password hashing to prevent rainbow table attacks.",
          why: "Security Standards"
        },
        {
          name: "RESTful API",
          desc: "Strict separation of concerns between the client and server, allowing independent scaling and potentially different frontend clients (mobile, web).",
          why: "Decoupling"
        }
      ]
    },
    ai: {
      title: "AI & Intelligence",
      icon: Brain,
      items: [
        {
          name: "Gemini 1.5 Pro",
          desc: "The core engine. Its 1M+ token context window allows us to analyze entire documents or long videos in a single pass, finding contradictions others miss.",
          why: "Massive Context Window"
        },
        {
          name: "Zero-Knowledge Arch",
          desc: "Designed so that the server knows as little as possible. PII is scrubbed locally before analysis requests are sent to the cloud.",
          why: "Privacy First"
        },
        {
          name: "Edge Inference (WASM)",
          desc: "Pre-analysis happens in the browser using WebAssembly. This reduces server load and gives instant feedback on simple forgery artifacts.",
          why: "Latency Reduction"
        }
      ]
    },
    data: {
      title: "Data & Infrastructure",
      icon: Database,
      items: [
        {
          name: "LowDB (JSON)",
          desc: "A local, file-based database. It allows for zero-configuration deployment and easy data portability/backup. Perfect for embedded or single-tenant instances.",
          why: "Simplicity & Portability"
        },
        {
          name: "Local-First Storage",
          desc: "Analysis results are cached locally to reduce redundant API calls and enable offline viewing of past reports.",
          why: "Efficiency"
        }
      ]
    }
  };

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/30 bg-primary/5 text-primary">
            Full System Disclosure
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Technical <span className="text-primary">Deep Dive</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We believe in transparency. Here is a complete breakdown of every tool, technology, and architectural decision that powers DeepTrust AI.
          </p>
        </motion.div>

        <Tabs defaultValue="frontend" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 h-auto p-1 bg-background/50 backdrop-blur-md border border-border/50 rounded-xl shadow-lg relative overflow-hidden group">
              {/* Reactive Glow for Tabs List */}
              <div className="absolute -inset-px bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {Object.entries(categories).map(([key, category]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="relative z-10 flex flex-col gap-2 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:bg-muted/50"
                >
                  <category.icon className="w-5 h-5" />
                  <span className="text-xs md:text-sm font-medium">{category.title.split(" ")[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(categories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Left: Description & Items */}
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
                      <category.icon className="w-6 h-6 text-primary" />
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground">
                      Selected for stability, performance, and future scalability.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {category.items.map((item, idx) => (
                      <Card key={idx} className="bg-background/50 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.2)] group relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-1 bg-primary/0 group-hover:bg-primary/50 transition-all duration-300" />
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold text-foreground">
                              {item.name}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs font-normal">
                              {item.why}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <p className="text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Right: Visual/Code Block (Dynamic based on category) */}
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-[#0f1117] min-h-[400px] flex flex-col group">
                   {/* Pro Code Block Glow */}
                   <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-blue-600/10 to-transparent blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                   
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                   <div className="relative flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="text-xs font-mono text-muted-foreground ml-2">
                      src/{key}/implementation.ts
                    </div>
                  </div>
                  
                  <div className="relative p-6 font-mono text-xs md:text-sm overflow-x-auto flex-1">
                    {key === 'frontend' && (
                      <div className="space-y-1 text-blue-300">
                        <div><span className="text-purple-400">import</span> {`{ motion }`} <span className="text-purple-400">from</span> "framer-motion";</div>
                        <div><span className="text-purple-400">import</span> {`{ ThemeProvider }`} <span className="text-purple-400">from</span> "@/components/theme-provider";</div>
                        <br/>
                        <div><span className="text-purple-400">export default function</span> <span className="text-yellow-400">App</span>() {`{`}</div>
                        <div className="pl-4"><span className="text-purple-400">return</span> (</div>
                        <div className="pl-8">{`<ThemeProvider defaultTheme="dark">`}</div>
                        <div className="pl-12">{`<motion.div initial={{ opacity: 0 }}>`}</div>
                        <div className="pl-16">{`<Dashboard />`}</div>
                        <div className="pl-12">{`</motion.div>`}</div>
                        <div className="pl-8">{`</ThemeProvider>`}</div>
                        <div className="pl-4">);</div>
                        <div>{`}`}</div>
                      </div>
                    )}
                    {key === 'backend' && (
                      <div className="space-y-1 text-green-300">
                        <div><span className="text-purple-400">const</span> express = <span className="text-yellow-400">require</span>('express');</div>
                        <div><span className="text-purple-400">const</span> jwt = <span className="text-yellow-400">require</span>('jsonwebtoken');</div>
                        <br/>
                        <div>app.<span className="text-yellow-400">post</span>('/api/verify', <span className="text-purple-400">async</span> (req, res) ={'>'} {`{`}</div>
                        <div className="pl-4"><span className="text-gray-500">// Secure Token Verification</span></div>
                        <div className="pl-4"><span className="text-purple-400">const</span> token = req.headers['authorization'];</div>
                        <div className="pl-4"><span className="text-purple-400">if</span> (!token) <span className="text-purple-400">return</span> res.sendStatus(401);</div>
                        <br/>
                        <div className="pl-4"><span className="text-purple-400">const</span> user = <span className="text-yellow-400">verifyUser</span>(token);</div>
                        <div className="pl-4">res.<span className="text-yellow-400">json</span>({'{ status: "Secure", user: user.id }'});</div>
                        <div>{`}`});</div>
                      </div>
                    )}
                    {key === 'ai' && (
                      <div className="space-y-1 text-orange-300">
                         <div><span className="text-purple-400">const</span> genAI = <span className="text-purple-400">new</span> <span className="text-yellow-400">GoogleGenerativeAI</span>(API_KEY);</div>
                         <br/>
                         <div><span className="text-purple-400">async function</span> <span className="text-yellow-400">analyzeDeepfake</span>(file) {`{`}</div>
                         <div className="pl-4"><span className="text-gray-500">// 1M+ Context Window Analysis</span></div>
                         <div className="pl-4"><span className="text-purple-400">const</span> model = genAI.<span className="text-yellow-400">getGenerativeModel</span>({'{ model: "gemini-1.5-pro" }'});</div>
                         <br/>
                         <div className="pl-4"><span className="text-purple-400">const</span> result = <span className="text-purple-400">await</span> model.<span className="text-yellow-400">generateContent</span>([</div>
                         <div className="pl-8">"Analyze for manipulation artifacts:",</div>
                         <div className="pl-8">fileToGenerativePart(file)</div>
                         <div className="pl-4">]);</div>
                         <div className="pl-4"><span className="text-purple-400">return</span> result.response.<span className="text-yellow-400">text</span>();</div>
                         <div>{`}`}</div>
                      </div>
                    )}
                    {key === 'data' && (
                      <div className="space-y-1 text-cyan-300">
                        <div>{`{`}</div>
                        <div className="pl-4">"users": [</div>
                        <div className="pl-8">{`{`}</div>
                        <div className="pl-12">"id": "u_12345",</div>
                        <div className="pl-12">"role": "admin",</div>
                        <div className="pl-12">"tokens_used": 15420,</div>
                        <div className="pl-12">"preferences": {'{ "theme": "dark" }'}</div>
                        <div className="pl-8">{`},`}</div>
                        <div className="pl-4">],</div>
                        <div className="pl-4">"analysis_logs": [</div>
                        <div className="pl-8">{`{`}</div>
                        <div className="pl-12">"timestamp": "2024-02-08T10:00:00Z",</div>
                        <div className="pl-12">"risk_score": 85,</div>
                        <div className="pl-12">"type": "video_deepfake"</div>
                        <div className="pl-8">{`}`}</div>
                        <div className="pl-4">]</div>
                        <div>{`}`}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
