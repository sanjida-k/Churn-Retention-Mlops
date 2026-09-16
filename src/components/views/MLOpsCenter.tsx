import React, { useState } from 'react';
import { 
  Cpu, 
  GitBranch, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Terminal, 
  RefreshCw, 
  ShieldAlert, 
  Sliders, 
  HardDrive,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { MODEL_BENCHMARKS, FEATURE_DRIFTS, MLFLOW_RUNS } from '../../data/telecomData';
import { usePlatform } from '../../context/PlatformContext';

export const MLOpsCenter: React.FC = () => {
  const { formatCurrencyText } = usePlatform();
  const [retrainingStatus, setRetrainingStatus] = useState<string | null>(null);

  const triggerRetraining = () => {
    setRetrainingStatus('Initiating automated ML pipeline re-training job on Cloud Run / Vertex AI...');
    setTimeout(() => {
      setRetrainingStatus('Hyperparameter tuning complete. Candidate model XGBoost v2.5 achieved 0.898 ROC-AUC. Ready for canary rollout.');
      setTimeout(() => setRetrainingStatus(null), 6000);
    }, 1500);
  };

  const getCleanModelName = (name: string) => {
    if (name.includes('XGBoost')) return 'XGBoost';
    if (name.includes('LightGBM')) return 'LightGBM';
    if (name.includes('Random Forest')) return 'Random Forest';
    if (name.includes('Logistic Regression')) return 'Logistic Regression';
    return name.split(' ')[0];
  };

  // Model comparison benchmark data with ROC-AUC, Recall, and F1 Score mapped
  const modelCompData = MODEL_BENCHMARKS.map(m => ({
    name: getCleanModelName(m.modelName),
    rocAuc: Number((m.rocAuc * 100).toFixed(1)),
    recall: Number((m.recall * 100).toFixed(1)),
    f1Score: Number((m.f1Score * 100).toFixed(1)),
    accuracy: Number((m.accuracy * 100).toFixed(1)),
    precision: Number((m.precision * 100).toFixed(1)),
    latency: m.latencyMs,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <span>Engineering & Model Governance</span>
            <span>•</span>
            <span className="text-slate-500 font-medium">Secondary Technical Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            MLOps & Observability Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Technical telemetry: Benchmark candidate algorithms, audit population stability (PSI), inspect MLflow runs, and govern production SLAs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Model & SLA Info (Moved from header) */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-2xs">
            <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span>Model: <strong>XGBoost • 99.4% SLA</strong></span>
          </div>

          <button
            onClick={triggerRetraining}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retrain Active Pipeline</span>
          </button>
        </div>
      </div>

      {retrainingStatus && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-900 flex items-center gap-2 shadow-2xs">
          <Activity className="h-4 w-4 text-indigo-600 animate-spin" />
          <span>{retrainingStatus}</span>
        </div>
      )}

      {/* Production Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Production Model</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-base font-bold text-slate-900 flex items-center justify-between">
            <span>XGBoost Classifier v2.4</span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              99.4% SLA
            </span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            Champion model in production serving
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Production ROC-AUC</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-indigo-600">
            0.892
          </div>
          <div className="mt-1 text-xs text-slate-500">
            PR-AUC: 0.841 • F1: 0.832
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">p95 Inference Latency</span>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-900">
            14.2 ms
          </div>
          <div className="mt-1 text-xs text-slate-500">
            SLA target: &lt; 50 ms
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Maximum Feature PSI</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-amber-600">
            0.215
          </div>
          <div className="mt-1 text-xs text-amber-700 font-medium">
            Drift detected in Support Tickets
          </div>
        </div>
      </div>

      {/* SECTION 1: Model Benchmarking & Model Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Model Evaluation & Benchmark Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-metric validation across candidate algorithms on 20% holdout test cohort
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-medium text-slate-600">
              N=1,408 Test Split
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelCompData} barSize={24}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#64748b" fontSize={12} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="rocAuc" name="ROC-AUC (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" name="Recall (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1Score" name="F1 Score (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Champion Model Dossier */}
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                PRODUCTION SERVING
              </span>
              <span className="text-xs font-mono text-slate-400">v2.4.1</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-2">
              XGBoost Telecom-Classifier
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Gradient boosted tree with depth-6 regularization and Bayesian optimized weights.
            </p>

            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">ROC-AUC:</span>
                <strong className="font-mono text-slate-900 font-bold">0.892</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Precision:</span>
                <strong className="font-mono text-slate-900">0.814</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Recall:</span>
                <strong className="font-mono text-slate-900">0.852</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Inference Latency:</span>
                <strong className="font-mono text-emerald-600">14.2 ms</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trained Date:</span>
                <span className="font-mono text-slate-600">2026-08-28</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Deployed via BentoML / Docker container on Cloud Run.
          </div>
        </div>
      </div>

      {/* Model Benchmarking Leaderboard Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Model Candidate Registry & Benchmarks
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Algorithm Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1 Score</th>
                <th className="py-3 px-4">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MODEL_BENCHMARKS.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {m.modelName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                      m.status === 'Production Active' ? 'bg-emerald-100 text-emerald-800 font-bold' :
                      m.status === 'Challenger' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {m.rocAuc.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">
                    {(m.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">
                    {(m.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">
                    {(m.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">
                    {m.f1Score.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {m.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Data Drift (Population Stability Index - PSI) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                Data Drift & Population Stability Index (PSI)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              PSI thresholds: &lt; 0.1 Stable • 0.1 - 0.2 Slight Shift • &gt; 0.2 Critical Drift Requiring Model Retraining
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Monitoring window: Last 30 Days
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Feature Vector</th>
                <th className="py-3 px-4">Baseline Distribution</th>
                <th className="py-3 px-4">Current Cohort Distribution</th>
                <th className="py-3 px-4">PSI Score</th>
                <th className="py-3 px-4">Stability Assessment</th>
                <th className="py-3 px-4 text-right">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FEATURE_DRIFTS.map((drift, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold font-mono text-slate-900">
                    {drift.feature}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {formatCurrencyText(drift.baselineMean)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                    {formatCurrencyText(drift.currentMean)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={drift.psi > 0.2 ? 'text-rose-600' : drift.psi > 0.1 ? 'text-amber-600' : 'text-emerald-600'}>
                      {drift.psi}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                      drift.status === 'Critical Drift' ? 'bg-rose-100 text-rose-700' :
                      drift.status === 'Slight Shift' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {drift.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-xs">
                    {drift.status === 'Critical Drift' ? (
                      <span className="font-bold text-rose-600">Recalibrate weights</span>
                    ) : drift.status === 'Slight Shift' ? (
                      <span className="text-amber-700 font-medium">Continue observation</span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: MLflow Experiment Tracking & Runs */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">
              MLflow Experiment Tracking Logs
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">Registry: mlflow.telecom-corp.internal</span>
        </div>

        <div className="space-y-3">
          {MLFLOW_RUNS.map((run) => (
            <div key={run.runId} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{run.runId}</span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700 font-semibold">
                    {run.experiment}
                  </span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 font-semibold">
                    {run.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">{run.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block mb-1 uppercase font-bold">Hyperparameters</span>
                  <div className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    {JSON.stringify(run.parameters, null, 2)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1 uppercase font-bold">Logged Metrics</span>
                  <div className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    {JSON.stringify(run.metrics, null, 2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
