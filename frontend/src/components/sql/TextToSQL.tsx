import React, { useState } from 'react';
import { Database, Search, ShieldCheck, Play, Code, Sparkles, Table, History } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { queryTextToSQL } from '../../services/api';
import { SQLResult } from '../../types';

export const TextToSQL: React.FC = () => {
  const [prompt, setPrompt] = useState('Which formulation produced the highest yield in Q3?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SQLResult | null>({
    generated_sql: 'WITH ranked_yields AS (\n  SELECT formulation_code, AVG(yield_percentage) AS avg_yield, RANK() OVER (ORDER BY AVG(yield_percentage) DESC) as rank\n  FROM experiments\n  GROUP BY formulation_code\n)\nSELECT formulation_code, round(avg_yield, 2) AS max_yield FROM ranked_yields WHERE rank <= 5;',
    execution_status: 'SUCCESS',
    execution_time_ms: 14.2,
    columns: ['formulation_code', 'max_yield'],
    rows: [
      ['F-409', 96.85],
      ['F-102', 92.40],
      ['F-301', 89.10],
      ['F-205', 86.70]
    ],
    recommended_chart: { chart_type: 'bar', x_axis: 'formulation_code', y_axis: 'max_yield' },
    explanation: 'Executed CTE query with window ranking functions. Formulation F-409 achieved top average yield of 96.85%.'
  });

  const chartData = result
    ? result.rows.map((row) => ({ [result.columns[0]]: row[0], [result.columns[1]]: row[1] }))
    : [];

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await queryTextToSQL(prompt);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Which formulation produced the highest yield in Q3?",
    "Rank batches by compliance score using window functions",
    "Join SOP compliance with experiment yield averages"
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-400" />
          Natural Language SQL Engine & AST Security Guard
        </h2>
        <p className="text-sm text-slate-400">Ask natural language R&D questions→Gemini Text-to-SQL + sqlglot AST security parser + auto-charting</p>
      </div>

      {/* Sample Query Pills */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">Sample Queries:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setPrompt(p)}
            className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300 hover:border-amber-500/60 transition"
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={handleQuery} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a question about experiments, formulations, or SOP compliance..."
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center gap-2 transition shadow-lg shadow-amber-950"
        >
          <Search className="w-4 h-4" />
          <span>Execute SQL</span>
        </button>
      </form>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SQL Code View & Security AST */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-amber-400" />
                Generated SQL AST (PostgreSQL dialect)
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>sqlglot AST Verified (Read-Only)</span>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {result.generated_sql}
            </pre>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Query Explanation
              </p>
              <p className="text-xs text-slate-300">{result.explanation}</p>
            </div>
          </div>

          {/* Dynamic Auto-Chart & Result Table */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dynamic Auto-Chart Visualization</h3>
              <span className="text-[11px] font-mono text-slate-400">Execution time: {result.execution_time_ms}ms</span>
            </div>

            {chartData.length > 0 && (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey={result.columns[0]} stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey={result.columns[1]} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Result Table */}
            <div className="overflow-auto max-h-48 border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    {result.columns.map((col, i) => (
                      <th key={i} className="px-4 py-2.5 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {result.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
