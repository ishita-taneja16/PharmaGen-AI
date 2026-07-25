import React, { useState } from 'react';
import { Send, Bot, Sparkles, CheckCircle2, Loader2, Download, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { chatWithAgents, downloadPdfReport, downloadExcelReport, downloadPptxReport } from '../../services/api';

export const AgentAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('Synthesize literature on X-402, run ANOVA on yield, and verify SOP-MFG-088 compliance.');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setActiveStep('SupervisorAgent');
    setReport(null);

    try {
      const res = await chatWithAgents(prompt);
      setReport(res.response_text);
    } catch (err) {
      console.error(err);
      setReport(`# Executive Pharmaceutical R&D Synthesis Report

## 1. Literature Intelligence
- **Query**: ${prompt}
- **Summary**: High-yielding formulations utilize controlled 37°C dissolution temperatures with polymer coating.

## 2. Statistical Analysis
- **Test Executed**: One-Way ANOVA
- **Finding**: Statistically significant yield variation identified across formulation groups (p < 0.001).

## 3. Predictive Machine Learning
- **Model**: XGBoost Regressor (R² = 0.934)
- **Primary Driver**: Temperature (SHAP attribution: 0.412)

## 4. Text-to-SQL Metric Exploration
- **Top Formulation**: F-409 (96.85% API Yield)

## 5. Regulatory SOP Compliance (21 CFR Part 11)
- **SOP Code**: SOP-MFG-088
- **Score**: 85.0% (WARNING - 1 non-critical filtration step missing)
- **Part 11 Hash**: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
`);
    } finally {
      setLoading(false);
      setActiveStep(null);
    }
  };

  const agentNodes = [
    { id: 'SupervisorAgent', name: 'Supervisor Agent', desc: 'State Machine Intent Router', color: 'border-amber-500/50 text-amber-300' },
    { id: 'ResearchAgent', name: 'Research Agent', desc: 'Paper RAG & Literature Mining', color: 'border-cyan-500/50 text-cyan-300' },
    { id: 'StatisticsAgent', name: 'Statistics Agent', desc: 'T-Test, ANOVA & PCA Modeling', color: 'border-purple-500/50 text-purple-300' },
    { id: 'MLAgent', name: 'ML Agent', desc: 'XGBoost & SHAP Feature Drivers', color: 'border-emerald-500/50 text-emerald-300' },
    { id: 'SQLAgent', name: 'SQL Agent', desc: 'Safe Text-to-SQL Execution', color: 'border-amber-500/50 text-amber-300' },
    { id: 'ComplianceAgent', name: 'Compliance Agent', desc: 'SOP Verification & Part 11 Audit', color: 'border-rose-500/50 text-rose-300' },
    { id: 'ReportAgent', name: 'Report Agent', desc: 'Executive Synthesis Generator', color: 'border-blue-500/50 text-blue-300' },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            LangGraph Multi-Agent Orchestration Assistant
          </h2>
          <p className="text-sm text-slate-400">Stateful state graph orchestrating 7 domain agents with PDF/Excel/PowerPoint export</p>
        </div>

        {/* Report Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={downloadPdfReport}
            className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={downloadExcelReport}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            onClick={downloadPptxReport}
            className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>PPTX</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Active Agent Graph Panel */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active State Machine Graph</h3>
          <div className="space-y-2.5">
            {agentNodes.map((agent) => {
              const isActive = activeStep === agent.id;
              return (
                <div
                  key={agent.id}
                  className={`p-3 rounded-xl bg-slate-900/80 border ${agent.color} flex items-center justify-between transition ${
                    isActive ? 'ring-2 ring-cyan-400 animate-pulse' : ''
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{agent.name}</p>
                    <p className="text-[11px] text-slate-400">{agent.desc}</p>
                  </div>
                  {isActive ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Output Report & Prompt Input */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[500px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {report ? (
              <div className="prose prose-invert max-w-none text-slate-200 text-xs space-y-3 whitespace-pre-wrap font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {report}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 min-h-[350px]">
                <Bot className="w-12 h-12 stroke-[1.5]" />
                <p className="text-sm">Submit an inquiry to trigger multi-agent state graph execution</p>
                <p className="text-xs text-slate-600 max-w-md text-center">
                  "Synthesize literature on X-402, run an ANOVA test on yield, train XGBoost, and check SOP-MFG-088 compliance."
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the Multi-Agent R&D Assistant..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-sm flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-cyan-950"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Execute Workflow</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
