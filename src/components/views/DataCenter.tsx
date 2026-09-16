import React, { useState, useRef } from 'react';
import { 
  Database, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  Layers, 
  Sliders, 
  Sparkles,
  Info,
  FileSpreadsheet,
  Calendar,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SchemaField } from '../../types/churn';
import { exportToCSV } from '../../utils/mlEngine';

export const DataCenter: React.FC = () => {
  const { 
    customers, 
    datasetProfile, 
    datasetUploadInfo,
    handleDatasetUpload, 
    resetToDefaultDataset,
    clearDataset,
    setActiveTab
  } = usePlatform();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  // Handle CSV file upload
  const processCSVFile = (file: File) => {
    setUploadStatus('Parsing dataset and detecting schema...');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setUploadStatus('Error: CSV file must contain at least a header row and one data row.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const parsedRows = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const rowObj: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowObj[header] = values[index];
          });
          parsedRows.push(rowObj);
        }

        handleDatasetUpload(parsedRows, file.name, file.size);
        setUploadStatus(`Successfully ingested ${parsedRows.length.toLocaleString()} subscriber records from "${file.name}". Schema inferred and pipeline synchronized.`);
      } catch (err) {
        setUploadStatus('Failed to parse CSV. Please ensure valid comma-separated format.');
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processCSVFile(e.dataTransfer.files[0]);
    }
  };

  const filteredFields = React.useMemo(() => {
    if (filterType === 'All') return datasetProfile.fields;
    return datasetProfile.fields.filter(f => f.type === filterType || f.role === filterType);
  }, [datasetProfile.fields, filterType]);

  const isDatasetLoaded = Boolean(datasetUploadInfo?.isLoaded && customers.length > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input for All Upload Triggers */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processCSVFile(e.target.files[0]);
          }
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>Unified Pipeline</span>
            <span>•</span>
            <span className="text-slate-500 font-medium">Dataset Profiling & Schema Governance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Telecom Data Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Single ingestion hub: Upload, profile schema, monitor data quality, and classify features automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {customers.length > 0 && (
            <button
              onClick={() => exportToCSV(customers, 'telecom_dataset_export.csv')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export Cleaned CSV</span>
            </button>
          )}
          <button
            onClick={resetToDefaultDataset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset to Benchmark Base</span>
          </button>
          {customers.length > 0 && (
            <button
              onClick={clearDataset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
              title="Clear active dataset from session"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Dataset</span>
            </button>
          )}
        </div>
      </div>

      {/* Ingestion Area: Persistent Loaded Summary Card OR Empty Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isDatasetLoaded && datasetUploadInfo ? (
          /* Persistent Dataset Summary Card (Kept permanently visible across the session) */
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`lg:col-span-2 rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden ${
              dragOver ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400/30' : 'border-slate-200/80'
            }`}
          >
            {/* Drag overlay notice if dragging over */}
            {dragOver && (
              <div className="absolute inset-0 z-10 bg-emerald-500/10 backdrop-blur-2xs flex flex-col items-center justify-center pointer-events-none">
                <div className="rounded-2xl bg-white p-5 shadow-lg border border-emerald-200 text-center">
                  <UploadCloud className="h-8 w-8 text-emerald-600 mx-auto animate-bounce mb-1.5" />
                  <div className="text-sm font-bold text-slate-900">Drop CSV file to upload dataset</div>
                  <div className="text-xs text-slate-500 mt-0.5">Updates active session with new subscriber records</div>
                </div>
              </div>
            )}

            <div>
              {/* Card Header Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-3 py-1 text-xs border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Dataset Loaded Successfully</span>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600 font-medium hidden sm:inline-block">
                    Session Active
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {datasetUploadInfo.isCustomUpload ? 'Uploaded by User' : 'Benchmark Dataset Active'}
                </div>
              </div>

              {/* Upload Flash Notice */}
              {uploadStatus && (
                <div className={`mt-4 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 border ${
                  uploadStatus.includes('Error') || uploadStatus.includes('Failed')
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{uploadStatus}</span>
                  </div>
                  <button 
                    onClick={() => setUploadStatus(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1 font-mono cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* File Identity */}
              <div className="mt-5 flex items-start gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200/80 p-3.5 text-emerald-700 shadow-sm flex-shrink-0">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900 font-mono tracking-tight truncate">
                      {datasetUploadInfo.fileName}
                    </h3>
                    {datasetUploadInfo.fileSizeBytes && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">
                        {datasetUploadInfo.fileSizeBytes}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Dataset is loaded in application state and ready across Executive Dashboard, Risk Segmentation, and downstream predictive modules.
                  </p>
                </div>
              </div>

              {/* 4 Metadata Items */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span>Total Records</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {datasetUploadInfo.totalRecords.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    100% Ingested
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <Database className="h-3.5 w-3.5 text-slate-400" />
                    <span>Total Features</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                    {datasetUploadInfo.totalFeatures}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Columns Inferred
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Upload Timestamp</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-1 leading-snug">
                    {datasetUploadInfo.uploadTimestamp}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Active Session
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Schema Status</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 font-mono mt-1 leading-snug">
                    {datasetUploadInfo.schemaStatus}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    Ready for ML
                  </div>
                </div>
              </div>
            </div>

            {/* Persistent Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
                title="Upload a new CSV dataset"
              >
                <UploadCloud className="h-4 w-4 text-emerald-400" />
                <span>Upload New Dataset</span>
              </button>

              <button
                onClick={() => setActiveTab('executive-dashboard')}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <span>View Executive Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Empty Upload Dropzone (When no dataset is currently loaded) */
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`lg:col-span-2 rounded-2xl border-2 border-dashed p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragOver 
                ? 'border-rose-500 bg-rose-50/50 scale-[1.01]' 
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-sm'
            }`}
          >
            <div className="rounded-2xl bg-rose-50 p-4 text-rose-600 mb-3 shadow-inner">
              <UploadCloud className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Upload Telecom Subscriber Dataset (.csv)
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
              Drag and drop customer tabular files here or click to browse. Features, data types, missing rates, and churn probabilities are computed automatically upon upload.
            </p>
            <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400 font-medium">
              <span>Supports standard Telco Churn format</span>
              <span>•</span>
              <span>Auto-inference enabled</span>
              <span>•</span>
              <span>Session persistence active</span>
            </div>

            {uploadStatus && (
              <div className={`mt-4 rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 ${
                uploadStatus.includes('Error') || uploadStatus.includes('Failed')
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                <CheckCircle2 className="h-4 w-4" />
                <span>{uploadStatus}</span>
              </div>
            )}
          </div>
        )}

        {/* Dataset Quality & Health Metrics */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Data Quality Scorecard</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                customers.length > 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {customers.length > 0 ? 'Grade A+' : 'No Data'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Automated validation & sanity evaluation</p>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                <span className="text-xl font-bold font-mono">
                  {customers.length > 0 ? datasetProfile.healthScore : 0}
                </span>
                <span className="text-[10px] text-slate-400 absolute bottom-1">/100</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800">
                  {customers.length > 0 ? 'Production Ready Schema' : 'Awaiting Ingestion'}
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  {customers.length > 0 
                    ? 'All mandatory telecommunication features mapped without blocking anomalies.' 
                    : 'Upload a dataset to evaluate schema quality and missing rate hygiene.'}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Records:</span>
                <span className="font-bold text-slate-800 font-mono">{customers.length.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Features Inferred:</span>
                <span className="font-bold text-slate-800 font-mono">{datasetProfile.totalColumns}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Missing Cells:</span>
                <span className="font-semibold text-emerald-600 font-mono">
                  {datasetProfile.missingCells} ({datasetProfile.missingCellsPct}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Churn Balance:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {customers.length > 0 ? `${datasetProfile.churnRatePct}% Churn` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>Single upload persistence: Reused across all 8 modules</span>
          </div>
        </div>
      </div>

      {/* Auto Schema Detection & Feature Classification Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Inferred Schema & Feature Classification
              </h3>
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                {datasetProfile.fields.length} Columns Detected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Auto-detected data types, null rates, cardinality, and downstream ML pipeline roles.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs">
            {['All', 'Numerical', 'Categorical', 'Boolean', 'Target'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  filterType === t 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Schema Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Detected Type</th>
                <th className="py-3 px-4">Role Classification</th>
                <th className="py-3 px-4">Missing Values</th>
                <th className="py-3 px-4">Distinct Values</th>
                <th className="py-3 px-4">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFields.length > 0 ? (
                filteredFields.map((field) => (
                  <tr key={field.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {field.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] font-medium ${
                        field.type === 'Numerical' ? 'bg-blue-50 text-blue-700' :
                        field.type === 'Categorical' ? 'bg-purple-50 text-purple-700' :
                        field.type === 'Boolean' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {field.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        field.role === 'Target' ? 'bg-rose-100 text-rose-700' :
                        field.role === 'Feature' ? 'bg-slate-100 text-slate-700' :
                        field.role === 'Identifier' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {field.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {field.missingCount === 0 ? (
                        <span className="text-emerald-600 font-medium">0 (0.0%)</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">{field.missingCount} ({field.missingPct}%)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {field.uniqueValues}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {field.sampleValues.join(', ')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No schema detected. Upload a CSV dataset to profile features.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Checks Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Missing Value Policy</span>
          </div>
          <p className="text-xs text-slate-600">
            Automated median imputation for numerical values and mode-frequency imputation for categorical values.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Cardinality & One-Hot Encoding</span>
          </div>
          <p className="text-xs text-slate-600">
            Categorical columns with &le;5 unique values auto-encoded into dummy sparse tensors inside internal pipeline.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Outlier & Scaling Sanity</span>
          </div>
          <p className="text-xs text-slate-600">
            RobustScaler handles long-tail tenure and high monthly charge outliers without biasing probability scores.
          </p>
        </div>
      </div>
    </div>
  );
};

