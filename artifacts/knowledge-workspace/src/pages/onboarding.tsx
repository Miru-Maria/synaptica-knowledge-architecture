import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useListOnboardingSessions, 
  useCreateOnboardingSession,
  useListOnboardingMessages
} from "@workspace/api-client-react";
import { useSSEChat } from "@/hooks/use-sse-chat";
import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Plus, History, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(true);

  // New Session Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [kb, setKb] = useState("");

  const sessionsQuery = useListOnboardingSessions();
  const createMutation = useCreateOnboardingSession();
  
  const messagesQuery = useListOnboardingMessages(activeSessionId || 0, {
    query: { enabled: !!activeSessionId }
  });

  const chatEndpoint = `/api/knowledge/onboarding/sessions/${activeSessionId}/messages`;
  const chat = useSSEChat(chatEndpoint);
  
  const [inputMsg, setInputMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history when switching sessions
  useEffect(() => {
    if (messagesQuery.data) {
      chat.setInitialMessages(messagesQuery.data.map(m => ({ role: m.role, content: m.content })));
    }
  }, [messagesQuery.data, chat.setInitialMessages]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages, chat.isTyping]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !kb) return;
    createMutation.mutate(
      { data: { name, role, knowledgeBase: kb } },
      {
        onSuccess: (data) => {
          sessionsQuery.refetch();
          setActiveSessionId(data.id);
          setShowNewForm(false);
          setName(""); setRole(""); setKb("");
        }
      }
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeSessionId || chat.isTyping) return;
    chat.sendMessage(inputMsg);
    setInputMsg("");
  };

  return (
    <Layout>
      <PageHeader 
        title="Onboarding Assistant" 
        description="Interactive RAG-powered agent to onboard new hires based on injected company documentation."
        icon={<Bot className="w-6 h-6" />}
      />

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 relative">
        {/* Left Sidebar - History */}
        <div className="lg:w-64 flex flex-col gap-4">
          <Button 
            onClick={() => { setShowNewForm(true); setActiveSessionId(null); }}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white justify-start"
          >
            <Plus className="w-4 h-4 mr-2" /> New Session
          </Button>

          <div className="flex-1 bg-card/40 rounded-xl border border-white/5 overflow-y-auto custom-scrollbar p-2 glass">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2 mt-2">
              <History className="w-3 h-3" /> Recent Sessions
            </h4>
            {sessionsQuery.isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-1">
                {sessionsQuery.data?.map(session => (
                  <button
                    key={session.id}
                    onClick={() => { setActiveSessionId(session.id); setShowNewForm(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate",
                      activeSessionId === session.id 
                        ? "bg-primary/20 text-primary font-medium border border-primary/20" 
                        : "text-foreground/70 hover:bg-white/5 hover:text-foreground border border-transparent"
                    )}
                  >
                    {session.name} ({session.role})
                  </button>
                ))}
                {sessionsQuery.data?.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground py-4">No past sessions.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 flex flex-col overflow-hidden relative glass shadow-2xl">
          
          <AnimatePresence mode="wait">
            {showNewForm ? (
              <motion.div 
                key="new-form"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="p-8 max-w-2xl mx-auto w-full h-full flex flex-col justify-center"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-lg shadow-primary/20">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display mb-2">Initialize New Agent</h2>
                  <p className="text-muted-foreground">Provide the specific context and persona for this onboarding session.</p>
                </div>

                <form onSubmit={handleCreateSession} className="space-y-5">
                  <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-medium">Session / Trainee Name</label>
                      <Input value={name} onChange={e=>setName(e.target.value)} required className="bg-black/40 border-white/10" placeholder="e.g. Alice's Onboarding" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-medium">Target Role</label>
                      <Input value={role} onChange={e=>setRole(e.target.value)} required className="bg-black/40 border-white/10" placeholder="e.g. Frontend Engineer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Context Knowledge Base</label>
                    <Textarea 
                      value={kb} onChange={e=>setKb(e.target.value)} required 
                      className="bg-black/40 border-white/10 min-h-[150px] font-mono text-sm resize-none" 
                      placeholder="Paste wiki, HR policies, technical setup guides..." 
                    />
                  </div>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold">
                    {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Agent Session"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                {/* Chat Header */}
                <div className="h-14 border-b border-white/10 bg-white/5 flex items-center px-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-sm">Active Session: {sessionsQuery.data?.find(s => s.id === activeSessionId)?.name}</span>
                    <Badge variant="outline" className="text-xs bg-white/5 ml-2">{sessionsQuery.data?.find(s => s.id === activeSessionId)?.role}</Badge>
                  </div>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {messagesQuery.isLoading && <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}
                  
                  {chat.messages.length === 0 && !messagesQuery.isLoading && (
                    <div className="text-center text-muted-foreground mt-20">
                      <Bot className="w-12 h-12 mx-auto opacity-20 mb-4" />
                      <p>Agent is initialized and ready.<br/>Say hello or ask a question.</p>
                    </div>
                  )}

                  {chat.messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                        msg.role === 'user' ? "bg-accent/20 text-accent border border-accent/30" : "bg-primary/20 text-primary border border-primary/30"
                      )}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                        msg.role === 'user' 
                          ? "bg-accent text-accent-foreground rounded-tr-sm" 
                          : "bg-white/5 border border-white/10 rounded-tl-sm text-foreground prose prose-invert max-w-none prose-p:my-1 prose-pre:my-2"
                      )}>
                        {msg.role === 'assistant' && !msg.content ? (
                          <span className="flex gap-1 items-center h-5">
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-75" />
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-150" />
                          </span>
                        ) : (
                          msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  ))}
                  {chat.error && (
                    <div className="text-destructive text-center text-sm p-2 bg-destructive/10 rounded-lg mx-auto w-max">{chat.error}</div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 border-t border-white/10 shrink-0">
                  <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto flex items-end gap-2">
                    <Textarea 
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                      placeholder="Type your message... (Press Enter to send)"
                      className="min-h-[56px] max-h-32 resize-none bg-black/40 border-white/20 focus:border-primary/50 pr-14 py-4 rounded-xl shadow-inner"
                      disabled={chat.isTyping}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!inputMsg.trim() || chat.isTyping}
                      className="absolute right-2 bottom-2 w-10 h-10 rounded-lg bg-primary hover:bg-primary/80 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </Layout>
  );
}
