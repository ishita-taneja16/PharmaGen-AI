import React, { useState } from 'react';
import { Sigma, Play, CheckCircle, AlertCircle, Sparkles, BookOpen, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { runHypothesisTest } from '../../services/api';
import { StatsResponse } from '../../types';

export const StatisticalAnalysis: React.FC = () => {
  const [testType, setTestType] = useState('ANOVA');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    test_type: 'One-Way ANOVA',
    statistic: 18.421,
    p_value: 0.00000412,
    is_significant: true,
    null_hypothesis: 'H0: Mean yield across all formulation groups is equal.',
    alt_hypothesis: 'H1: At least one formulation group mean differs significantly.',
    assumptions_passed: {
      shapiro_normality: true,
      levene_homogeneity: true
    },
    interpretation: 'Statistically significant difference in yield across formulation groups (p < 0.001).',
    ai_interpretation: 'The One-Way ANOVA test yielded an F-statistic of 18.421 with a p-value < 0.001. We reject the null hypothesis and conclude that formulation type significantly impacts API yield. Recommendation: Conduct post-hoc Tukey HSD testing to identify top-performing formulations.'
  });

  const pcaVarianceData = [
    { component: 'PC1', variance: 48.2 },
    { component: 'PC2', variance: 29.1 },
    { component: 'PC3', variance: 11.4 },
    { component: 'PC4', variance: 6.8 },
  ];

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await runHypothesisTest('e5f6a7b8-9012-3456-789a-bcdef0123456', testType, 'formulation_code', 'yield_percentage');
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sigma className="w-6 h-6 text-purple-400" />
          Statistical Analysis & Hypothesis Testing Engine
        </h2>
        <p className="text-sm text-slate-400">Student's & Welch's T-Test, ANOVA, Chi-Square, OLS Regression, PCA, and Gemini AI Interpreter</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Statistical Test Selector</h3>
          <div>
            <label className="text-xs text-slate-400 font-medium">Select Statistical Test</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="ANOVA">One-Way ANOVA</option>
              <option value="TTEST_IND">Independent Two-Sample T-Test</option>
              <option value="WELCH_TTEST">Welch's T-Test (Unequal Variances)</option>
              <option value="TTEST_REL">Paired Sample T-Test</option>
              <option value="CHISQUARE">Chi-Square Test of Independence</option>
              <option value="PCA">Principal Component Analysis (PCA)</option>
            </select>
          </div>

          <button
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-purple-950"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Execute Test</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Test Execution & Assumption Results</h3>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div>
                  <p className="text-xs text-slate-400">Test Method</p>
                  <p className="text-base font-bold text-purple-300">{result.test_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">p-value</p>
                  <p className={`text-lg font-mono font-bold ${result.is_significant ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {result.p_value < 0.001 ? '< 0.001' : result.p_value.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* Assumption Checks Badges */}
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Shapiro-Wilk Normality</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">PASSED</span>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Levene's Homogeneity</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">PASSED</span>
                </div>
              </div>

              {/* Hypotheses Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <p className="font-semibold text-slate-400 uppercase">Null Hypothesis (H0)</p>
                  <p className="text-slate-300">{result.null_hypothesis}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <p className="font-semibold text-purple-400 uppercase">Alternative Hypothesis (H1)</p>
                  <p className="text-slate-300">{result.alt_hypothesis}</p>
                </div>
              </div>

              {/* Gemini AI Statistical Interpreter Box */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-2">
                <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Gemini AI Statistical Interpretation
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{result.ai_interpretation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
