import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeDocumentationGaps } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Activity, AlertTriangle, CheckCircle2, Lightbulb, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GapsPage() {
  const [documentation, setDocumentation] = useState("");
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState("");

  const analyzeMutation = useAnalyzeDocumentationGaps();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentation.trim() || !context.trim()) return;
    analyzeMutation.mutate({ data: { documentation, context, audience: audience || undefined } });
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-white/10 text-white';
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Documentation Gap Analyzer" 
        description="Cross-reference existing docs with user stories or support tickets to automatically identify missing coverage."
        icon={<Activity className="w-6 h-6" />}
      />

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Left Form */}
        <motion.div 
          className="flex flex-col gap-6 lg:w-[40%]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <form onSubmit={handleAnalyze} className="flex flex-col gap-5 flex-1">
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> Existing Documentation
              </label>
              <Textarea 
                placeholder="Paste current documentation text..."
                className="flex-1 min-h-[150px] resize-none bg-black/20 border-white/10 focus:border-accent/50 text-sm font-mono"
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" /> Context (Support Tickets, Product Specs)
              </label>
              <Textarea 
                placeholder="Paste the context that documentation should be measured against..."
                className="flex-1 min-h-[150px] resize-none bg-black/20 border-white/10 focus:border-accent/50 text-sm font-mono"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Target Audience (Optional)</label>
              <Input 
                placeholder="e.g. Enterprise Admins, Junior Devs"
                className="bg-black/20 border-white/10"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/20"
              disabled={analyzeMutation.isPending || !documentation || !context}
            >
              {analyzeMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Activity className="w-5 h-5 mr-2" />}
              Run Gap Analysis
            </Button>
          </form>
        </motion.div>

        {/* Right Results */}
        <div className="lg:w-[60%] bg-card/40 rounded-2xl border border-white/5 p-6 overflow-y-auto custom-scrollbar glass relative">
          <AnimatePresence mode="wait">
            {!analyzeMutation.data && !analyzeMutation.isPending && (
              <motion.div 
                className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-50"
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              >
                <Activity className="w-16 h-16 mb-4" />
                <p>Waiting for analysis...</p>
              </motion.div>
            )}

            {analyzeMutation.isPending && (
              <motion.div 
                className="flex flex-col items-center justify-center h-full text-accent"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <Loader2 className="w-12 h-12 animate-spin opacity-50 mb-4" />
                <p className="animate-pulse">Evaluating contextual coverage...</p>
              </motion.div>
            )}

            {analyzeMutation.data && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Score Header */}
                <div className="flex items-center gap-6 p-6 bg-black/30 rounded-2xl border border-white/5">
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                      <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                        className={cn("text-accent transition-all duration-1000 ease-out")}
                        strokeDasharray={`${analyzeMutation.data.coverageScore * 2.83} 283`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold font-display text-white">{analyzeMutation.data.coverageScore}%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Coverage Score</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{analyzeMutation.data.summary}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" /> Key Recommendations</h4>
                  <ul className="space-y-2">
                    {analyzeMutation.data.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-foreground/90">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps List */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b border-white/10 pb-2">Identified Gaps</h4>
                  {analyzeMutation.data.gaps.map((gap, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                      <Card className="p-5 bg-black/20 border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-lg text-white">{gap.area}</h5>
                          <Badge variant="outline" className={cn("uppercase tracking-wider text-[10px]", getPriorityColor(gap.priority))}>
                            {gap.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">{gap.description}</p>
                        <div className="bg-accent/5 border border-accent/10 rounded-lg p-4">
                          <p className="text-xs font-semibold text-accent uppercase mb-1">Suggested Addition</p>
                          <p className="text-sm text-foreground/90 font-mono leading-relaxed">{gap.suggestedContent}</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
