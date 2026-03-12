import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, 
  FileText, 
  MessageSquare, 
  Bot, 
  TerminalSquare, 
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/search", label: "Knowledge Search", icon: Search },
  { path: "/gaps", label: "Gap Analyzer", icon: FileText },
  { path: "/faq", label: "Smart FAQ Builder", icon: MessageSquare },
  { path: "/onboarding", label: "Onboarding Assistant", icon: Bot },
  { path: "/prompts", label: "Prompt Toolkit", icon: TerminalSquare },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col relative z-20 sidebar-bg border-r border-white/[0.06]">
        {/* Logo area */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center emerald-glow"
              style={{
                background: "linear-gradient(135deg, hsl(161,65%,35%) 0%, hsl(150,80%,45%) 100%)"
              }}>
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-[15px] leading-tight text-white">Synaptica</h2>
              <p className="text-[10px] text-emerald-400/70 font-medium uppercase tracking-[0.15em]">Knowledge Architecture</p>
            </div>
          </div>

          {/* Thin emerald divider */}
          <div className="mt-5 h-px w-full" style={{
            background: "linear-gradient(90deg, hsl(161,65%,42%,0.6) 0%, transparent 80%)"
          }} />
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "text-white font-medium nav-active-glow" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 rounded-xl border-l-2"
                    style={{
                      background: "linear-gradient(90deg, hsl(161,65%,42%,0.18) 0%, transparent 100%)",
                      borderLeftColor: "hsl(161,65%,50%)"
                    }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn(
                  "w-4 h-4 relative z-10 transition-colors flex-shrink-0", 
                  isActive ? "text-emerald-400" : "group-hover:text-foreground"
                )} />
                <span className="relative z-10 text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer status */}
        <div className="p-4 m-3 rounded-xl border border-white/[0.06]"
          style={{ background: "hsl(161,20%,9%,0.8)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400/80 font-medium uppercase tracking-wider">Live</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            AI systems connected.<br/>
            All tools operational.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle top-right emerald ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(ellipse at top right, hsl(150,80%,50%) 0%, transparent 70%)"
          }} />
        {/* Bottom left charcoal depth */}
        <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none opacity-10"
          style={{
            background: "radial-gradient(ellipse at bottom left, hsl(161,30%,20%) 0%, transparent 70%)"
          }} />
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
