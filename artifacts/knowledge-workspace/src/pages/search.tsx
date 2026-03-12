import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKnowledgeSearch } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Database, ArrowRight, Loader2, Target } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState("");

  const searchMutation = useKnowledgeSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !documents.trim()) return;
    searchMutation.mutate({ data: { query, documents, topK: 5 } });
  };

  return (
    <Layout>
      <PageHeader 
        title="Semantic Knowledge Search" 
        description="Search across unindexed documentation using vector embeddings to find relevant excerpts and semantic matches."
        icon={<Search className="w-6 h-6" />}
      />

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Left: Input Form */}
        <motion.div 
          className="flex flex-col gap-6 lg:w-1/3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-6 flex-1">
            <div className="space-y-3 flex-1 flex flex-col">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Database className="w-4 h-4 text-primary" />
                Knowledge Base Content
              </label>
              <Textarea 
                placeholder="Paste raw documentation, policies, or knowledge base articles here..."
                className="flex-1 min-h-[250px] resize-none bg-black/20 border-white/10 focus:border-primary/50 text-sm font-mono"
                value={documents}
                onChange={(e) => setDocuments(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Target className="w-4 h-4 text-primary" />
                Search Query
              </label>
              <Input 
                placeholder="What are you looking for?"
                className="bg-black/20 border-white/10 h-12 text-lg px-4"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="h-12 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
              disabled={searchMutation.isPending || !query || !documents}
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Semantics...
                </>
              ) : (
                <>
                  Execute Search
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Right: Results */}
        <div className="lg:w-2/3 flex flex-col bg-card/40 rounded-2xl border border-white/5 p-6 custom-scrollbar overflow-y-auto relative glass">
          <AnimatePresence mode="wait">
            {!searchMutation.data && !searchMutation.isPending && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 py-20"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-medium text-foreground">No search executed</h3>
                <p className="max-w-sm">Provide your knowledge base content and a query to see semantic search in action.</p>
              </motion.div>
            )}

            {searchMutation.isPending && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-primary space-y-4 py-20"
              >
                <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                <p className="animate-pulse font-medium tracking-wide">Processing embeddings & computing similarities...</p>
              </motion.div>
            )}

            {searchMutation.data && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Analysis Summary</h4>
                  <p className="text-foreground text-sm leading-relaxed">{searchMutation.data.summary}</p>
                </div>

                <h3 className="font-display text-xl font-semibold mb-4">Top Results</h3>
                
                <div className="space-y-4">
                  {searchMutation.data.results.map((result, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx}
                    >
                      <Card className="p-5 bg-black/20 border-white/5 hover:border-primary/30 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{result.title}</h4>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {(result.relevanceScore * 100).toFixed(0)}% Match
                          </Badge>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 mb-3 border border-white/5">
                          <p className="text-sm font-mono text-muted-foreground line-clamp-3">"...{result.excerpt}..."</p>
                        </div>
                        <p className="text-sm text-foreground/80"><span className="font-semibold text-white/50 mr-2">Why relevant:</span>{result.explanation}</p>
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
