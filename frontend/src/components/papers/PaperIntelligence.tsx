import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Search, BookOpen, ExternalLink, Loader2, Sparkles, AlertCircle, Quote, CheckCircle2 } from 'lucide-react';
import { searchPapers, uploadPaper, getPaperDetail, getPaperStatus } from '../../services/api';
import { PaperSearchResult } from '../../types';

interface PaperItem {
  id?: string;
  title?: string | null;
  authors?: string | null;
  journal?: string | null;
  status?: string | null;
  progress_percentage?: number | null;
  executive_summary?: string | null;
  keywords?: Array<any> | null;
  citations?: Array<any> | null;
  uploaded_at?: string | null;
}

interface ProcessingInfo {
  id: string;
  title: string;
  status: string;
  progress: number;
  errorMessage?: string | null;
}

export const PaperIntelligence: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<PaperSearchResult[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<PaperItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Polling States: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT'
  const [uploadState, setUploadState] = useState<'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT'>('IDLE');
  const [processingInfo, setProcessingInfo] = useState<ProcessingInfo | null>(null);

  const pollingRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = (paperId: string, paperTitle: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    setUploadState('PROCESSING');
    setProcessingInfo({
      id: paperId,
      title: paperTitle,
      status: 'QUEUED',
      progress: 20,
    });

    const startTime = Date.now();

    const checkStatus = async () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= 60) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setUploadState('TIMEOUT');
        return;
      }

      try {
        const statusRes = await getPaperStatus(paperId);
        const currentStatus = statusRes.status || 'PROCESSING';
        const progress = statusRes.progress_percentage || 50;

        setProcessingInfo({
          id: paperId,
          title: statusRes.title || paperTitle,
          status: currentStatus,
          progress: progress,
          errorMessage: statusRes.error_message,
        });

        if (currentStatus === 'COMPLETED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setUploadState('COMPLETED');
          useStore.getState().triggerDashboardRefresh();
          try {
            const detail = await getPaperDetail(paperId);
            setSelectedPaper(detail);
          } catch (detailErr) {
            setErrorMessage('Unable to retrieve paper details.');
          }
        } else if (currentStatus === 'FAILED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setUploadState('FAILED');
          setErrorMessage(statusRes.error_message || 'Paper processing failed.');
        }
      } catch (err) {
        // Continue polling if transient error occurs
      }
    };

    checkStatus();
    pollingRef.current = setInterval(checkStatus, 2500);
  };

  const handleManualRefresh = async () => {
    if (!processingInfo?.id) return;
    try {
      const statusRes = await getPaperStatus(processingInfo.id);
      if (statusRes.status === 'COMPLETED') {
        setUploadState('COMPLETED');
        const detail = await getPaperDetail(processingInfo.id);
        setSelectedPaper(detail);
      } else if (statusRes.status === 'FAILED') {
        setUploadState('FAILED');
        setErrorMessage(statusRes.error_message || 'Paper processing failed.');
      } else {
        setProcessingInfo({
          ...processingInfo,
          status: statusRes.status || 'PROCESSING',
          progress: statusRes.progress_percentage || 75,
        });
      }
    } catch (err) {
      setErrorMessage('Unable to refresh paper status.');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setErrorMessage(null);
    setResults([]);
    setSelectedPaper(null);
    if (uploadState !== 'PROCESSING') setUploadState('IDLE');

    try {
      const res = await searchPapers(query);
      const searchResults: PaperSearchResult[] = res.results || [];
      setResults(searchResults);

      if (searchResults.length > 0 && searchResults[0].paper_id) {
        try {
          const detail = await getPaperDetail(searchResults[0].paper_id);
          setSelectedPaper(detail);
        } catch (detailErr: any) {
          if (detailErr.response?.status === 404) {
            setErrorMessage('No paper found.');
          } else {
            setErrorMessage('Unable to retrieve paper details.');
          }
        }
      }
    } catch (err: any) {
      setResults([]);
      setSelectedPaper(null);
      if (err.response?.status === 404) {
        setErrorMessage('No paper found.');
      } else if (err.response?.status === 500) {
        setErrorMessage('Unable to retrieve paper details.');
      } else {
        setErrorMessage('Unable to retrieve paper details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaper = async (paperId: string) => {
    setErrorMessage(null);
    try {
      const detail = await getPaperDetail(paperId);
      setSelectedPaper(detail);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setErrorMessage('No paper found.');
      } else {
        setErrorMessage('Unable to retrieve paper details.');
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setErrorMessage(null);
    setSelectedPaper(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (authors) formData.append('authors', authors);
    if (journal) formData.append('journal', journal);

    try {
      const res = await uploadPaper(formData);
      const paperId = res.paper_id;
      const paperTitle = res.title || title;

      setTitle('');
      setAuthors('');
      setJournal('');
      setFile(null);
      setUploading(false);
      setResults([]);
      setHasSearched(false);

      if (paperId) {
        startPolling(paperId, paperTitle);
      }
    } catch (err: any) {
      setUploading(false);
      setUploadState('FAILED');
      setErrorMessage(err.response?.data?.detail || 'Failed to upload paper.');
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-cyan-400" />
          Scientific Paper Intelligence & Hybrid Vector RAG
        </h2>
        <p className="text-sm text-slate-400">
          PDF OCR, text mining, YAKE keyword extraction, citation parsing & pgvector similarity search
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Ingestion Box */}
        <form onSubmit={handleUpload} className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            Upload Scientific Paper (PDF)
          </h3>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paper Title..."
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            required
          />

          <input
            type="text"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="Authors (optional)..."
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 p-6 rounded-xl text-center cursor-pointer transition">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="pdf-upload-input"
            />
            <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-2 block">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">{file ? file.name : 'Click to select PDF document'}</p>
              <p className="text-[11px] text-slate-500">PDFPlumber text extraction + Tesseract OCR fallback</p>
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading || uploadState === 'PROCESSING'}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Start Ingestion Pipeline</span>
          </button>
        </form>

        {/* Vector Search Box */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search literature via pgvector cosine similarity..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>RAG Search</span>
            </button>
          </form>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 flex-1 flex flex-col justify-start">
            {results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => item.paper_id && handleSelectPaper(item.paper_id)}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 cursor-pointer hover:border-cyan-500/50 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                    {item.paper_title || 'Not Available'}
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                    Similarity: {(item.similarity_score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono">
                  "{item.content || 'Not Available'}"
                </p>
              </div>
            ))}

            {hasSearched && results.length === 0 && !loading && (
              <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3 flex flex-col items-center justify-center my-auto">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">No matching papers found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    No scientific paper matched your search query. Upload a paper or try another search.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Panel: Processing State Loading Card */}
      {uploadState === 'PROCESSING' && processingInfo && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-cyan-500/40 bg-slate-900/90 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">📄 Paper Uploaded Successfully</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {processingInfo.id}</p>
            </div>
          </div>

          <div className="space-y-1 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Title:</p>
            <p className="text-sm font-semibold text-cyan-300">{processingInfo.title || 'Not Available'}</p>
          </div>

          <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Status:</span>
            <span className="text-xs px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              {processingInfo.status === 'QUEUED'
                ? 'Queued'
                : processingInfo.status === 'EXTRACTING_TEXT'
                ? 'Processing OCR...'
                : processingInfo.status === 'GENERATING_EMBEDDINGS'
                ? 'Generating Embeddings...'
                : processingInfo.status}
            </span>
          </div>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pipeline:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Upload Complete</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  processingInfo.progress >= 30 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {processingInfo.progress >= 30 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="font-mono text-cyan-400">⏳</span>
                )}
                <span>OCR Extraction</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  processingInfo.progress >= 60 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {processingInfo.progress >= 60 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="font-mono text-cyan-400">⏳</span>
                )}
                <span>Chunking</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  processingInfo.progress >= 80 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {processingInfo.progress >= 80 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="font-mono text-cyan-400">⏳</span>
                )}
                <span>Vector Embeddings</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  processingInfo.progress >= 95 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {processingInfo.progress >= 95 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="font-mono text-cyan-400">⏳</span>
                )}
                <span>Gemini Summary</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Processing Progress</span>
                <span>{processingInfo.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${processingInfo.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 font-mono">Estimated Time: 5–20 seconds</div>
        </div>
      )}

      {/* Right Side Panel: Processing Failed */}
      {uploadState === 'FAILED' && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-800/80 bg-rose-950/30 space-y-3">
          <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            ❌ Paper Processing Failed
          </h3>
          <p className="text-xs text-rose-200">
            {processingInfo?.errorMessage || errorMessage || 'An error occurred during paper ingestion.'}
          </p>
        </div>
      )}

      {/* Right Side Panel: Polling Timeout */}
      {uploadState === 'TIMEOUT' && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-800/80 bg-amber-950/30 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Processing Taking Longer Than Expected
            </h3>
            <p className="text-xs text-amber-200">
              Processing is taking longer than expected. Your paper is still being indexed.
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-2 transition"
          >
            <Loader2 className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>
      )}

      {/* Right Side Panel: Selected Completed Paper Details */}
      {selectedPaper && uploadState !== 'PROCESSING' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">{selectedPaper.title || 'Not Available'}</h3>
              <p className="text-xs text-slate-400">
                {selectedPaper.authors || 'Not Available'} • {selectedPaper.journal || 'Not Available'}
              </p>
              {selectedPaper.uploaded_at && (
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Uploaded: {new Date(selectedPaper.uploaded_at).toLocaleString()}
                </p>
              )}
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              Status: {selectedPaper.status || 'COMPLETED'} ({selectedPaper.progress_percentage ?? 100}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="md:col-span-2 space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Executive Summary
              </h4>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {selectedPaper.executive_summary || 'Not Available'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">YAKE Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPaper.keywords && selectedPaper.keywords.length > 0 ? (
                    selectedPaper.keywords.map((kw: any, i: number) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60"
                      >
                        {typeof kw === 'string' ? kw : kw.keyword || 'Not Available'}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">Not Available</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5 text-slate-400" />
                  Extracted Citations
                </h4>
                <div className="space-y-1">
                  {selectedPaper.citations && selectedPaper.citations.length > 0 ? (
                    selectedPaper.citations.map((c: any, i: number) => (
                      <p key={i} className="text-[11px] text-cyan-400 font-mono truncate">
                        {typeof c === 'string' ? c : c.reference || 'Not Available'}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-mono">Not Available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
