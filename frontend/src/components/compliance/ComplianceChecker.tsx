import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  CheckSquare, 
  Loader2, 
  PlusCircle, 
  Database,
  AlertCircle
} from 'lucide-react';
import { verifyCompliance, createExperimentApi, addExperimentLogsApi } from '../../services/api';
import { useStore } from '../../store/useStore';

export const ComplianceChecker: React.FC = () => {
  const { activeExperimentId, setActiveExperimentId, selectedDatasetId } = useStore();
  const [sopCode, setSopCode] = useState('SOP-MFG-088');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize report state to null (no hardcoded demo objects)
  const [report, setReport] = useState<any>(null);

  const createBaselineExperiment = async (): Promise<string> => {
    setCreating(true);
    try {
      const expRes = await createExperimentApi({
        dataset_id: selectedDatasetId || null,
        title: 'API Formulation Baseline Synthesis Run',
        formulation_code: 'F-101',
        batch_number: `B-${Math.floor(100 + Math.random() * 900)}`,
        parameters: { temp: 60, stir_rate: 350, ph: 6.8 }
      });

      const expId = expRes.id;
      setActiveExperimentId(expId);

      // Seed initial execution steps
      await addExperimentLogsApi(expId, [
        { step_number: 1, step_description: "Charge reactor with raw API material and solvent." },
        { step_number: 2, step_description: "Heat mixture to 60°C ± 2°C for 45 minutes." },
        { step_number: 3, step_description: "Verify pH level is within 6.5 - 7.2 range." }
      ]);

      return expId;
    } catch (err: any) {
      console.error(err);
      throw new Error(err.response?.data?.detail || 'Failed to create baseline experiment entity.');
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      let targetExpId = activeExperimentId;

      // Auto-create valid experiment in PostgreSQL if none exists yet
      if (!targetExpId) {
        targetExpId = await createBaselineExperiment();
      }

      const res = await verifyCompliance(targetExpId, sopCode);
      setReport(res);
      useStore.getState().triggerDashboardRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'No experiment has been created yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExplicit = async () => {
    setError(null);
    try {
      const expId = await createBaselineExperiment();
      setReport(null);
      handleVerifyExplicit(expId);
    } catch (err: any) {
      setError(err.message || 'Failed to create experiment baseline.');
    }
  };

  const handleVerifyExplicit = async (expId: string) => {
    setLoading(true);
    try {
      const res = await verifyCompliance(expId, sopCode);
      setReport(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No experiment has been created yet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            SOP Compliance Checker & 21 CFR Part 11 Audit Engine
          </h2>
          <p className="text-sm text-slate-400">
            Automated protocol verification, gap analysis, quantitative risk scoring & SHA-256 Part 11 audit trails
          </p>
        </div>

        {activeExperimentId ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300">
            <Database className="w-3.5 h-3.5 text-rose-400" />
            <span>Active Exp ID: {activeExperimentId.slice(0, 8)}...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800 text-xs font-mono text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>No Active Experiment Baseline</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Configuration */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Target Regulation Baseline</h3>
          <div>
            <label className="text-xs text-slate-400 font-medium">SOP Protocol Code</label>
            <select
              value={sopCode}
              onChange={(e) => setSopCode(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="SOP-MFG-088">SOP-MFG-088: Active API Synthesis Protocol v2.1</option>
              <option value="SOP-QC-102">SOP-QC-102: HPLC Purity Testing Baseline</option>
              <option value="SOP-REG-204">SOP-REG-204: Bioreactor Temperature Maintenance</option>
            </select>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || creating}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-rose-950 disabled:opacity-50"
          >
            {loading || creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            <span>Verify Compliance Audit</span>
          </button>

          {!activeExperimentId && (
            <button
              onClick={handleCreateExplicit}
              disabled={creating}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-800/80 font-medium text-xs flex items-center justify-center gap-1.5 transition"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
              <span>Create Experiment Baseline</span>
            </button>
          )}

          {report && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Lock className="w-4 h-4" />
                <span>21 CFR Part 11 Cryptographic Verified</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">Hash: {report.payload_hash}</p>
            </div>
          )}
        </div>

        {/* Report Summary */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          {report ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Compliance Score</p>
                  <p className="text-2xl font-bold text-amber-400">{report.compliance_score}%</p>
                </div>
                <div className="glass-card p-4 rounded-xl space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Verdict Status</p>
                  <p className="text-base font-bold text-rose-400 uppercase tracking-wide">{report.overall_status}</p>
                </div>
                <div className="glass-card p-4 rounded-xl space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Risk Level</p>
                  <p className="text-base font-bold text-rose-300 uppercase">{report.risk_level}</p>
                </div>
              </div>

              {/* Missing Steps Gap Analysis */}
              {report.missing_steps && report.missing_steps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Protocol Missing Steps & Gap Analysis</h4>
                  <div className="space-y-2">
                    {report.missing_steps.map((gap: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-300">Step #{gap.step_number} Missing</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 uppercase font-mono">{gap.severity}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{gap.requirement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gemini CAPA Recommendations */}
              {report.capa_recommendations && report.capa_recommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini AI CAPA Recommendations
                  </h4>
                  <div className="space-y-1">
                    {report.capa_recommendations.map((capa: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{capa}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">Ready for SOP Audit Evaluation</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an SOP protocol baseline and click "Verify Compliance Audit" to run automated gap analysis and generate 21 CFR Part 11 audit entries.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
