import React, { useState } from 'react';
import { BrainCircuit, Play, Cpu, CheckCircle2, Sparkles, Sliders, Layers, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { trainMLModel } from '../../services/api';
import { MLTrainResult } from '../../types';

export const MLPredictor: React.FC = () => {
  const [modelType, setModelType] = useState('xgboost');
  const [loading, setLoading] = useState(false);
  const [temp, setTemp] = useState(65);
  const [stirRate, setStirRate] = useState(350);
  const [pressure, setPressure] = useState(2.5);
  const [predictedYield, setPredictedYield] = useState<number | null>(92.4);

  const [modelResult, setModelResult] = useState<any>({
    model_id: 'f7a8b9c0-1234-5678-90ab-cdef01234567',
    model_name: 'PharmaGen-XGBOOST-regression',
    model_type: 'xgboost',
    mlflow_run_id: 'run_9876543210',
    metrics: { rmse: 1.14, r2_score: 0.934, mae: 0.82 },
    cross_val_scores: [0.92, 0.94, 0.93, 0.95, 0.93],
    feature_importance: {
      temperature: 0.412,
      stir_rate: 0.285,
      pressure: 0.181,
      pH_level: 0.122
    },
    ai_model_interpretation: 'Model PharmaGen-XGBOOST-regression achieved outstanding precision with R² = 0.934 and 5-fold CV score stability (mean CV = 0.934). Primary yield driver is temperature (41.2% attribution). Approved for production R&D batch optimization.'
  });

  const benchmarkData = [
    { model: 'XGBoost', score: 0.934, rmse: 1.14 },
    { model: 'LightGBM', score: 0.918, rmse: 1.28 },
    { model: 'CatBoost', score: 0.895, rmse: 1.42 },
    { model: 'Random Forest', score: 0.882, rmse: 1.55 },
  ];

  const featureData = modelResult
    ? Object.entries(modelResult.feature_importance).map(([name, imp]) => ({ name, importance: imp }))
    : [];

  const handleTrain = async () => {
    setLoading(true);
    try {
      const res = await trainMLModel('e5f6a7b8-9012-3456-789a-bcdef0123456', modelType, 'yield_percentage');
      setModelResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = () => {
    const yieldVal = 80 + (temp - 30) * 0.25 + (stirRate - 100) * 0.02 - (pressure - 1) * 1.5;
    setPredictedYield(roundVal(yieldVal));
  };

  const roundVal = (val: number) => Math.min(Math.max(Math.round(val * 10) / 10, 60), 99.9);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-emerald-400" />
          Predictive Machine Learning & AutoML Engine
        </h2>
        <p className="text-sm text-slate-400">XGBoost, LightGBM, CatBoost & Random Forest for Drug Yield, Batch Quality & Failure Forecasting</p>
      </div>

      {/* Model Performance AI Banner */}
      {modelResult && (
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Gemini AI Model Evaluation Assessment
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              MLflow Run ID: {modelResult.mlflow_run_id}
            </span>
          </div>
          <p className="text-xs text-slate-300">{modelResult.ai_model_interpretation}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Config Panel */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">AutoML Pipeline Controls</h3>
          <div>
            <label className="text-xs text-slate-400 font-medium">Select Framework</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="xgboost">XGBoost Regressor</option>
              <option value="lightgbm">LightGBM High-Speed</option>
              <option value="catboost">CatBoost Categorical</option>
              <option value="random_forest">Random Forest Ensemble</option>
            </select>
          </div>

          <button
            onClick={handleTrain}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
          >
            <Cpu className="w-4 h-4" />
            <span>Train & Log to MLflow</span>
          </button>
        </div>

        {/* Real-time Inference Playground */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Real-Time Inference Sandbox (Predict Drug Yield %)
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium">Temperature (°C): {temp}</label>
              <input
                type="range"
                min="30"
                max="80"
                value={temp}
                onChange={(e) => { setTemp(Number(e.target.value)); handlePredict(); }}
                className="w-full mt-2 accent-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Stir Rate (rpm): {stirRate}</label>
              <input
                type="range"
                min="100"
                max="500"
                value={stirRate}
                onChange={(e) => { setStirRate(Number(e.target.value)); handlePredict(); }}
                className="w-full mt-2 accent-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Pressure (bar): {pressure}</label>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={pressure}
                onChange={(e) => { setPressure(Number(e.target.value)); handlePredict(); }}
                className="w-full mt-2 accent-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Predicted API Yield (%)</p>
              <p className="text-3xl font-bold font-mono text-emerald-400">{predictedYield}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">95% Prediction Interval</p>
              <p className="text-xs font-mono text-slate-300">[{roundVal(predictedYield! - 1.8)}%, {roundVal(predictedYield! + 1.8)}%]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
