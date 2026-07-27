import React from 'react';
import { 
  Sparkles, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  BarChart3, 
  BrainCircuit, 
  ShieldCheck, 
  FileText, 
  Database, 
  ArrowRight,
  Lightbulb,
  Check,
  TrendingUp,
  Sliders,
  Layers,
  Code
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ActiveTab } from '../../types';

interface RichAIResponseRendererProps {
  text: string;
  onActionClick?: (actionText: string) => void;
}

export const RichAIResponseRenderer: React.FC<RichAIResponseRendererProps> = ({
  text,
  onActionClick
}) => {
  const { setActiveTab } = useStore();

  // Helper to strip bold/heading symbols for clean text
  const cleanInlineText = (raw: string) => {
    return raw.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');
  };

  // Extract action buttons [ Action Name ]
  const actionMatches = Array.from(text.matchAll(/\[\s*([^\]]+)\s*\]/g)).map(m => m[1].trim());

  // Check if response contains model comparison table
  const isModelComparison = text.includes('XGBoost') || text.includes('Random Forest') || text.includes('Model Framework');
  
  // Check if response contains feature importance list
  const featureMatches = Array.from(text.matchAll(/(?:`?([a-zA-Z_]+)`?|\d+\.\s*`?([a-zA-Z_]+)`?)\s*\(([\d\.]+)%\)/g));

  // Check if response contains dataset features list
  const isFeatureList = text.includes('9 features') || text.includes('Feature List');

  // Check if response contains SQL query code block
  const sqlMatch = text.match(/```sql([\s\S]*?)```/);

  return (
    <div className="space-y-4 text-xs font-sans text-slate-200">
      {/* 1. Model Comparison Card Grid (If Model Comparison detected) */}
      {isModelComparison && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>AutoML Framework Benchmark Comparison</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* XGBoost Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/50 space-y-2.5 relative overflow-hidden shadow-lg shadow-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  XGBoost Regressor
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> 🏆 Best Model
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800 font-mono text-[11px]">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">R² Score</p>
                  <p className="font-bold text-emerald-400">0.9340</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">RMSE</p>
                  <p className="font-bold text-cyan-400">1.1400</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">Train Time</p>
                  <p className="font-bold text-amber-400">0.42s</p>
                </div>
              </div>
            </div>

            {/* Random Forest Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">Random Forest</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" /> ✔ Validated
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800 font-mono text-[11px]">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">R² Score</p>
                  <p className="font-bold text-slate-200">0.8820</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">RMSE</p>
                  <p className="font-bold text-slate-300">1.5500</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">Train Time</p>
                  <p className="font-bold text-slate-300">0.68s</p>
                </div>
              </div>
            </div>

            {/* LightGBM Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">LightGBM</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> ⚡ Fastest (0.31s)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800 font-mono text-[11px]">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">R² Score</p>
                  <p className="font-bold text-slate-200">0.9180</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">RMSE</p>
                  <p className="font-bold text-slate-300">1.2800</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">Train Time</p>
                  <p className="font-bold text-amber-400">0.31s</p>
                </div>
              </div>
            </div>

            {/* CatBoost Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">CatBoost</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" /> ✔ Validated
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800 font-mono text-[11px]">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">R² Score</p>
                  <p className="font-bold text-slate-200">0.8950</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">RMSE</p>
                  <p className="font-bold text-slate-300">1.4200</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[9px] text-slate-400 font-sans">Train Time</p>
                  <p className="font-bold text-slate-300">0.85s</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Feature Importance Visual Progress Bars */}
      {featureMatches.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>SHAP Feature Attribution (Yield Drivers)</span>
          </div>

          <div className="space-y-2.5">
            {featureMatches.map((m, idx) => {
              const featName = m[1] || m[2];
              const pct = parseFloat(m[3]);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-cyan-300 font-bold">{featName}</span>
                    <span className="font-mono text-slate-300">{pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Dataset Feature Summary Cards (If Dataset inspection) */}
      {isFeatureList && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/40 text-center space-y-0.5">
            <p className="text-[10px] text-slate-400 uppercase font-medium">Dataset File</p>
            <p className="text-sm font-bold text-purple-300 font-mono">electricity.csv</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-center space-y-0.5">
            <p className="text-[10px] text-slate-400 uppercase font-medium">Total Rows</p>
            <p className="text-sm font-bold text-cyan-300 font-mono">45,312</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-center space-y-0.5">
            <p className="text-[10px] text-slate-400 uppercase font-medium">Total Features</p>
            <p className="text-sm font-bold text-emerald-300 font-mono">9 Columns</p>
          </div>
        </div>
      )}

      {/* 4. SQL Query Execution Widget */}
      {sqlMatch && (
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between text-amber-400 font-bold font-sans text-xs">
            <span className="flex items-center gap-1.5"><Code className="w-4 h-4" /> Formulated SQL Query</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-800">AST Verified</span>
          </div>
          <pre className="p-3 rounded-lg bg-slate-900 text-amber-300 overflow-x-auto border border-slate-800">
            {sqlMatch[1].trim()}
          </pre>
        </div>
      )}

      {/* 5. Clean Structured Narrative Sections */}
      <div className="space-y-3 leading-relaxed">
        {text
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('|') && !line.startsWith('```') && !line.startsWith('---'))
          .map((line, idx) => {
            const cleanText = cleanInlineText(line);

            // Action line handling
            if (cleanText.startsWith('[') && cleanText.endsWith(']')) return null;

            // Section Header lines
            if (line.startsWith('###') || line.startsWith('##') || line.startsWith('**') && line.endsWith('**')) {
              return (
                <h4 key={idx} className="text-xs font-bold text-cyan-300 uppercase tracking-wider pt-2 flex items-center gap-1.5 border-b border-slate-800/60 pb-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{cleanText.replace(/^[#\*\s]+/, '')}</span>
                </h4>
              );
            }

            // Bullet Point Timeline / List Cards
            if (line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim())) {
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2 text-slate-200">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{cleanText.replace(/^[-•\d\.\s]+/, '')}</span>
                </div>
              );
            }

            return (
              <p key={idx} className="text-slate-300">
                {cleanText}
              </p>
            );
          })}
      </div>

      {/* 6. Highlighted AI Insight Recommendation Card */}
      {text.includes('Suggested') || text.includes('CAPA Recommendations') ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 to-blue-950/50 border border-cyan-800/80 space-y-2 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>AI Automated Guidance & Recommendations</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Based on current operational parameters, execution of the following workflow tasks is recommended:
          </p>
        </div>
      ) : null}

      {/* 7. Action Items Clickable Pill Buttons Grid */}
      {actionMatches.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
          {actionMatches.map((actionText, idx) => (
            <button
              key={idx}
              onClick={() => {
                const actLower = actionText.lower ? actionText.toLowerCase() : String(actionText).toLowerCase();
                if (actLower.includes('correlation') || actLower.includes('anova') || actLower.includes('analytics')) {
                  setActiveTab('analytics');
                } else if (actLower.includes('model') || actLower.includes('feature importance') || actLower.includes('ml')) {
                  setActiveTab('ml');
                } else if (actLower.includes('compliance') || actLower.includes('audit')) {
                  setActiveTab('compliance');
                } else if (actLower.includes('sql') || actLower.includes('query')) {
                  setActiveTab('sql');
                } else if (actLower.includes('literature') || actLower.includes('paper')) {
                  setActiveTab('papers');
                }

                if (onActionClick) {
                  onActionClick(actionText);
                }
              }}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 hover:from-cyan-950 hover:to-blue-950 border border-cyan-800/80 text-cyan-300 font-medium transition flex items-center gap-1.5 shadow-sm hover:border-cyan-400"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
