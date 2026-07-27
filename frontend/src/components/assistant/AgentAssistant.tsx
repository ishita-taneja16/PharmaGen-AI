import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  User, 
  BookOpen, 
  BarChart3, 
  BrainCircuit, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Search,
  Layers,
  Circle
} from 'lucide-react';
import { chatWithAgents, downloadPdfReport, downloadExcelReport, downloadPptxReport } from '../../services/api';
import { useStore } from '../../store/useStore';
import { ActiveTab } from '../../types';
import { RichAIResponseRenderer } from './RichAIResponseRenderer';

interface AgentStatusItem {
  id: string;
  name: string;
  desc: string;
  status: 'completed' | 'skipped' | 'thinking';
  color: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  executedAgent?: string;
  agentStatuses?: AgentStatusItem[];
  timestamp: string;
}

export const AgentAssistant: React.FC = () => {
  const { setActiveTab } = useStore();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickActionChips = [
    { label: '📊 How many features in dataset?', prompt: 'How many features are in my dataset?' },
    { label: '🤖 Compare RF with XGBoost', prompt: 'Compare Random Forest with XGBoost' },
    { label: '📄 Summarize papers', prompt: 'Summarize uploaded papers' },
    { label: '📊 Explain ANOVA', prompt: 'Explain ANOVA' },
    { label: '🔍 Generate SQL for avg nswprice', prompt: 'Generate SQL for average nswprice' },
    { label: '🛡️ Check SOP compliance', prompt: 'Check SOP compliance' },
    { label: '📈 Generate executive report', prompt: 'Generate executive report' }
  ];

  const allAgentNodes = [
    { id: 'SupervisorAgent', name: 'Supervisor Agent', desc: 'Intent Router', color: 'text-amber-400' },
    { id: 'ResearchAgent', name: 'Research Agent', desc: 'Literature & Papers', color: 'text-cyan-400' },
    { id: 'StatisticsAgent', name: 'Statistics Agent', desc: 'Dataset EDA & ANOVA', color: 'text-purple-400' },
    { id: 'MLAgent', name: 'ML Agent', desc: 'Predictive AutoML & SHAP', color: 'text-emerald-400' },
    { id: 'SQLAgent', name: 'SQL Agent', desc: 'Text-to-SQL Engine', color: 'text-amber-400' },
    { id: 'ComplianceAgent', name: 'Compliance Agent', desc: '21 CFR Part 11 Audit', color: 'text-rose-400' },
    { id: 'ReportAgent', name: 'Report Agent', desc: 'Executive Synthesis', color: 'text-blue-400' },
  ];

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId = `user_${Date.now()}`;
    const assistantMsgId = `ai_${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // User message turn
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: currentTime
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    // Initial status: Supervisor thinking
    const initialStatuses: AgentStatusItem[] = allAgentNodes.map((a) => ({
      id: a.id,
      name: a.name,
      desc: a.desc,
      status: a.id === 'SupervisorAgent' ? 'thinking' : 'skipped',
      color: a.color
    }));

    const aiMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: 'Identifying query intent and routing to specialized agent node...',
      agentStatuses: initialStatuses,
      timestamp: currentTime
    };

    setMessages((prev) => [...prev, aiMsg]);

    try {
      const res = await chatWithAgents(textToSend);

      const activeList: string[] = res.active_agents || ['SupervisorAgent', res.executed_agent || 'StatisticsAgent'];
      const executed = res.executed_agent || (activeList.length > 1 ? activeList[1] : 'StatisticsAgent');

      // Build agent status list: active agents = completed, others = skipped
      const finalStatuses: AgentStatusItem[] = allAgentNodes.map((a) => {
        const isExecuted = a.id === 'SupervisorAgent' || a.id === executed || activeList.includes(a.id);
        return {
          id: a.id,
          name: a.name,
          desc: a.desc,
          status: isExecuted ? 'completed' : 'skipped',
          color: a.color
        };
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: res.response_text || 'Completed request.',
                executedAgent: executed,
                agentStatuses: finalStatuses
              }
            : m
        )
      );
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: 'Failed to process request. Please try again.',
                agentStatuses: allAgentNodes.map((a) => ({ ...a, status: 'skipped' }))
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header Banner */}
      <div className="flex items-center justify-between shrink-0 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            Intent-Routed Multi-Agent R&D Assistant
          </h2>
          <p className="text-sm text-slate-400">
            Autonomous Supervisor Intent Router → Executes ONLY requested domain agent (Research, Stats, ML, SQL, Compliance, Report)
          </p>
        </div>

        {/* Report Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPdfReport}
            className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition shadow"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={downloadExcelReport}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={downloadPptxReport}
            className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition shadow"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>PPTX</span>
          </button>
        </div>
      </div>

      {/* Quick Action Prompt Chips Bar */}
      <div className="flex flex-wrap gap-2 shrink-0 py-1">
        {quickActionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(chip.prompt)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-500/60 transition disabled:opacity-50 flex items-center gap-1 shadow-sm"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Conversational Thread Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 py-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950">
              <Bot className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-bold text-slate-200">How can I assist your R&D workflow today?</h3>
              <p className="text-xs text-slate-400">
                Ask specific questions to invoke specialized agents on-demand. The Supervisor Agent will route to ONLY the necessary domain node.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar Icon */}
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Content Container */}
              <div
                className={`max-w-3xl rounded-2xl p-4 space-y-4 shadow-xl border ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500/40 rounded-tr-none'
                    : 'glass-panel text-slate-100 border-slate-800/80 rounded-tl-none'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between text-[11px] opacity-80 border-b border-white/10 pb-2">
                  <span className="font-bold flex items-center gap-1.5">
                    {msg.sender === 'user' ? (
                      <>
                        <User className="w-3.5 h-3.5" />
                        <span>Researcher</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>PharmaGen AI Assistant</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>

                {/* Main Scoped Answer Text */}
                {msg.sender === 'assistant' ? (
                  <RichAIResponseRenderer
                    text={msg.text}
                    onActionClick={(actionText) => handleSendPrompt(actionText)}
                  />
                ) : (
                  <div className="text-xs leading-relaxed font-sans">{msg.text}</div>
                )}

                {/* Agent Execution & Skipped Status Matrix */}
                {msg.agentStatuses && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      Supervisor Intent Routing Matrix
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {msg.agentStatuses.map((st) => {
                        const isCompleted = st.status === 'completed';
                        const isThinking = st.status === 'thinking';
                        return (
                          <div
                            key={st.id}
                            className={`p-2 rounded-xl border text-[11px] flex items-center justify-between transition ${
                              isCompleted
                                ? 'bg-slate-950 border-emerald-800/60'
                                : 'bg-slate-950/40 border-slate-900 opacity-60'
                            }`}
                          >
                            <span className={`font-medium text-[11px] ${isCompleted ? st.color : 'text-slate-500'}`}>
                              {st.name.replace(' Agent', '')}
                            </span>
                            {isThinking ? (
                              <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                            ) : isCompleted ? (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Circle className="w-2.5 h-2.5 text-slate-600" /> Skipped
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-center text-xs text-cyan-400 font-medium py-2 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span>Supervisor Agent evaluating intent & routing query...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Prompt Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(prompt);
        }}
        className="shrink-0 flex gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a specific question (e.g., How many features are in my dataset? or Compare Random Forest with XGBoost)..."
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-sm flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-cyan-950"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
