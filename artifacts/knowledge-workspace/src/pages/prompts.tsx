import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  useListPrompts, 
  useCreatePrompt, 
  useDeletePrompt 
} from "@workspace/api-client-react";
import { useSSEChat } from "@/hooks/use-sse-chat";
import { fetchSSE } from "@/lib/sse";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TerminalSquare, BookTemplate, Play, Save, Copy, Trash2, Plus, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

// Helper to extract variables wrapped in {{...}}
function extractVariables(template: string) {
  const regex = /\{\{\s*([^}]+)\s*\}\}/g;
  const matches = [...template.matchAll(regex)];
  return Array.from(new Set(matches.map(m => m[1].trim())));
}

export default function PromptsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("library");

  // Library State
  const promptsQuery = useListPrompts();
  const deleteMutation = useDeletePrompt();

  // Test State
  const [testTemplate, setTestTemplate] = useState("Review the following {{document_type}} and summarize the {{focus_area}}.\n\nContent: {{content}}");
  const variables = useMemo(() => extractVariables(testTemplate), [testTemplate]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  
  const [testResult, setTestResult] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  // Save State
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [saveCat, setSaveCat] = useState("general");
  const createMutation = useCreatePrompt();

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult("");
    
    await fetchSSE(
      "/api/knowledge/prompts/test",
      {
        method: "POST",
        body: JSON.stringify({ template: testTemplate, variables: varValues })
      },
      (data) => {
        if (data.content) setTestResult(prev => prev + data.content);
      },
      () => { setIsTesting(false); },
      (err) => {
        setIsTesting(false);
        toast({ title: "Error", description: "Failed to run test", variant: "destructive" });
      }
    );
  };

  const handleSave = () => {
    if (!saveName || !testTemplate) return;
    createMutation.mutate({
      data: {
        name: saveName,
        description: saveDesc,
        category: saveCat,
        template: testTemplate,
        variables
      }
    }, {
      onSuccess: () => {
        toast({ title: "Saved", description: "Prompt added to library" });
        setShowSaveForm(false);
        promptsQuery.refetch();
        setActiveTab("library");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Template copied to clipboard" });
  };

  return (
    <Layout>
      <PageHeader 
        title="Prompt Engineering Toolkit" 
        description="A centralized library for high-quality, reusable LLM prompts for documentation engineering."
        icon={<TerminalSquare className="w-6 h-6" />}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-black/30 border border-white/5 w-max mb-6">
          <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <BookTemplate className="w-4 h-4 mr-2" /> Library
          </TabsTrigger>
          <TabsTrigger value="test" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Play className="w-4 h-4 mr-2" /> Sandbox / Test
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
          
          <TabsContent value="library" className="m-0 space-y-6">
            {promptsQuery.isLoading && <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {promptsQuery.data?.map((prompt) => (
                <Card key={prompt.id} className="bg-card/40 border-white/5 hover:border-primary/30 transition-colors flex flex-col glass overflow-hidden">
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg leading-tight">{prompt.name}</h3>
                      {prompt.isBuiltIn ? (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] uppercase">System</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] uppercase border-white/10">{prompt.category}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{prompt.description}</p>
                    
                    <div className="bg-black/50 p-3 rounded-lg border border-white/5 mb-4 relative group">
                      <pre className="text-xs font-mono text-white/70 whitespace-pre-wrap line-clamp-4">{prompt.template}</pre>
                      <Button 
                        size="icon" variant="secondary" 
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20"
                        onClick={() => copyToClipboard(prompt.template)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="secondary" className="w-full bg-white/5 hover:bg-white/10 text-xs h-8" 
                        onClick={() => { setTestTemplate(prompt.template); setActiveTab("test"); }}
                      >
                        Load to Sandbox
                      </Button>
                      {!prompt.isBuiltIn && (
                        <Button variant="destructive" size="icon" className="h-8 w-8 bg-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => {
                            if(confirm("Delete this prompt?")) deleteMutation.mutate({id: prompt.id}, { onSuccess: ()=>promptsQuery.refetch()})
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="test" className="m-0 flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
            {/* Left: Template Editor */}
            <div className="flex flex-col gap-4 lg:w-1/2">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-sm font-semibold flex items-center gap-2"><TerminalSquare className="w-4 h-4 text-primary" /> Template Editor</span>
                <Button size="sm" variant="outline" className="h-8 bg-black/40 border-white/10 text-xs" onClick={() => setShowSaveForm(!showSaveForm)}>
                  <Save className="w-3 h-3 mr-2" /> {showSaveForm ? "Cancel Save" : "Save to Library"}
                </Button>
              </div>

              {showSaveForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-4">
                  <div className="flex gap-4">
                    <div className="space-y-1.5 flex-1"><label className="text-xs">Name</label><Input value={saveName} onChange={e=>setSaveName(e.target.value)} className="h-8 bg-black/40 text-xs"/></div>
                    <div className="space-y-1.5 w-32"><label className="text-xs">Category</label><Input value={saveCat} onChange={e=>setSaveCat(e.target.value)} className="h-8 bg-black/40 text-xs"/></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-xs">Description</label><Input value={saveDesc} onChange={e=>setSaveDesc(e.target.value)} className="h-8 bg-black/40 text-xs"/></div>
                  <Button size="sm" className="w-full h-8" onClick={handleSave} disabled={!saveName || createMutation.isPending}>Confirm Save</Button>
                </motion.div>
              )}

              <Textarea 
                value={testTemplate} onChange={e => setTestTemplate(e.target.value)}
                className="flex-1 resize-none font-mono text-sm leading-relaxed bg-black/40 border-white/10 focus:border-primary/50 p-5 rounded-xl shadow-inner"
                placeholder="Use {{variable_name}} syntax to create inputs..."
              />
            </div>

            {/* Right: Variables & Execution */}
            <div className="flex flex-col gap-4 lg:w-1/2 bg-card/40 rounded-xl border border-white/5 p-5 glass relative">
              
              {variables.length > 0 && (
                <div className="bg-black/30 rounded-lg p-4 border border-white/5 space-y-3 mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">Detected Variables</h4>
                  {variables.map(v => (
                    <div key={v} className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded w-max">{"{{"}{v}{"}}"}</label>
                      <Textarea 
                        value={varValues[v] || ""} 
                        onChange={e => setVarValues(prev => ({...prev, [v]: e.target.value}))}
                        className="h-10 min-h-0 bg-black/40 border-white/10 text-sm"
                        placeholder={`Value for ${v}...`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleTest} disabled={isTesting || !testTemplate}
                className="w-full h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-white font-bold"
              >
                {isTesting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
                Execute Prompt
              </Button>

              <div className="flex-1 mt-4 flex flex-col">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-white/10 pb-2">Output Preview</h4>
                <div className="flex-1 bg-black/50 border border-white/5 rounded-xl p-5 overflow-y-auto custom-scrollbar prose prose-invert prose-sm max-w-none">
                  {testResult ? (
                    <ReactMarkdown>{testResult}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground/50 italic text-center mt-10">Run the prompt to see results here.</p>
                  )}
                  {isTesting && (
                    <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                  )}
                </div>
              </div>

            </div>
          </TabsContent>

        </div>
      </Tabs>
    </Layout>
  );
}
