import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuildFaq } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { MessageSquare, Layers, Wand2, Loader2 } from "lucide-react";

export default function FaqPage() {
  const [documentation, setDocumentation] = useState("");
  const [audience, setAudience] = useState("");
  const [maxItems, setMaxItems] = useState("10");

  const buildMutation = useBuildFaq();

  const handleBuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentation.trim()) return;
    buildMutation.mutate({ 
      data: { 
        documentation, 
        audience: audience || undefined,
        maxItems: parseInt(maxItems) || 10
      } 
    });
  };

  return (
    <Layout>
      <PageHeader 
        title="Smart FAQ Builder" 
        description="Transform flat, dense documentation into highly structured, intent-based Q&A tailored for specific audiences."
        icon={<MessageSquare className="w-6 h-6" />}
      />

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        <motion.div 
          className="lg:w-[35%] flex flex-col gap-6"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        >
          <form onSubmit={handleBuild} className="flex flex-col gap-5 flex-1">
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Source Documentation
              </label>
              <Textarea 
                placeholder="Paste the raw manual or feature spec here..."
                className="flex-1 min-h-[300px] resize-none bg-black/20 border-white/10 focus:border-emerald-500/50 font-mono text-sm"
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-semibold">Target Audience</label>
                <Input 
                  placeholder="e.g. End Users"
                  className="bg-black/20 border-white/10"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div className="space-y-2 w-32">
                <label className="text-sm font-semibold">Max Items</label>
                <Input 
                  type="number"
                  min="1" max="20"
                  className="bg-black/20 border-white/10"
                  value={maxItems}
                  onChange={(e) => setMaxItems(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="h-12 text-white font-bold shadow-lg"
              style={{
                background: "linear-gradient(135deg, hsl(161,65%,35%) 0%, hsl(150,70%,40%) 100%)",
                boxShadow: "0 4px 20px hsl(161,65%,42%,0.3)"
              }}
              disabled={buildMutation.isPending || !documentation}
            >
              {buildMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Wand2 className="w-5 h-5 mr-2" />}
              Generate FAQ Structure
            </Button>
          </form>
        </motion.div>

        <div className="lg:w-[65%] bg-card/40 rounded-2xl border border-white/5 p-6 overflow-y-auto glass relative">
          <AnimatePresence mode="wait">
            {!buildMutation.data && !buildMutation.isPending && (
              <motion.div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-50"
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}>
                <MessageSquare className="w-16 h-16 mb-4" />
                <p>Ready to structure your knowledge.</p>
              </motion.div>
            )}

            {buildMutation.isPending && (
              <motion.div className="flex flex-col items-center justify-center h-full text-emerald-400"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-12 h-12 animate-spin opacity-50 mb-4" />
                <p className="animate-pulse">Extracting intents and formulating answers...</p>
              </motion.div>
            )}

            {buildMutation.data && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
                <div className="rounded-xl p-5 mb-8 border"
                  style={{
                    background: "hsl(161,65%,42%,0.08)",
                    borderColor: "hsl(161,65%,42%,0.25)"
                  }}>
                  <h3 className="font-semibold text-emerald-400 mb-2">Generation Summary</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{buildMutation.data.summary}</p>
                </div>

                {buildMutation.data.categories.map((category, idx) => {
                  const categoryFaqs = buildMutation.data.faqs.filter(f => f.category === category);
                  if (categoryFaqs.length === 0) return null;

                  return (
                    <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                      <h4 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-3">
                        <div className="w-2 h-6 rounded-full" style={{ background: "linear-gradient(180deg, hsl(150,80%,55%) 0%, hsl(161,65%,35%) 100%)" }} />
                        {category}
                      </h4>
                      <Accordion type="multiple" className="space-y-3">
                        {categoryFaqs.map((faq, fIdx) => (
                          <AccordionItem
                            key={fIdx}
                            value={`item-${idx}-${fIdx}`}
                            className="bg-black/30 border border-white/5 rounded-xl px-4 overflow-hidden transition-colors"
                            style={{ borderColor: undefined }}
                            data-state-open-border="hsl(161,65%,42%,0.3)"
                          >
                            <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold text-base hover:text-emerald-300 transition-colors">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-4 text-base leading-relaxed">
                              <div className="mb-4">
                                {faq.answer}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                                {faq.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="bg-white/5 text-xs text-white/60 hover:bg-white/10">#{tag}</Badge>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
