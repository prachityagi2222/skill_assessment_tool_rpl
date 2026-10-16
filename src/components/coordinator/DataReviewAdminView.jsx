import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  AlertTriangle, 
  Edit3, 
  CheckCircle2, 
  Save, 
  Flag, 
  Check, 
  Database, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  History
} from 'lucide-react';
import { dataRepository } from '../../services/dataRepository';
import { Button } from '../common/Button';
import { NsqfBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const DataReviewAdminView = ({ initialStatusFilter = 'ALL' }) => {
  const [qualifications, setQualifications] = useState([]);
  const [sources, setSources] = useState([]);
  const [reviewIssues, setReviewIssues] = useState([]);
  const [modules, setModules] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [performanceCriteria, setPerformanceCriteria] = useState([]);
  const [assessmentMethods, setAssessmentMethods] = useState([]);

  // Active Tab: 'records' | 'curricula' | 'issues' | 'sources'
  const [activeTab, setActiveTab] = useState('records');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter); // 'ALL' | 'extracted' | 'reviewed' | 'verified' | 'requires_review'
  const [selectedDuration, setSelectedDuration] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  // Employability Skills Curricula Tab Sub-selection: 30 | 60 | 90 | 120
  const [selectedEsHours, setSelectedEsHours] = useState(30);

  // Detail Modal for a Qualification Record
  const [viewingRecord, setViewingRecord] = useState(null);
  const [viewingRecordTab, setViewingRecordTab] = useState('details'); // 'details' | 'criteria' | 'assessment' | 'history'

  // Edit / Correction Modal
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ 
    title: '', 
    code: '', 
    level: '', 
    awarding_body: '', 
    valid_till: '',
    sector: ''
  });
  const [reviewStatus, setReviewStatus] = useState('reviewed');
  const [reviewNotes, setReviewNotes] = useState('');

  // Flag Modal
  const [flaggingRecord, setFlaggingRecord] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagSeverity, setFlagSeverity] = useState('MEDIUM');

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function loadData() {
      await dataRepository.init();
      setQualifications(dataRepository.getQualifications());
      setSources(dataRepository.getQualificationSources());
      setReviewIssues(dataRepository.getExtractionReviewIssues());
      setModules(dataRepository.getModules());
      setCompetencies(dataRepository.getCompetencies());
      setPerformanceCriteria(dataRepository.getPerformanceCriteria());
      setAssessmentMethods(dataRepository.getAssessmentMethods());
    }
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Distinct sectors from qualifications
  const distinctSectors = useMemo(() => {
    const set = new Set();
    qualifications.forEach(q => {
      if (q.sector) set.add(q.sector);
    });
    return Array.from(set).sort();
  }, [qualifications]);

  // Verification statistics
  const verificationCounts = useMemo(() => {
    const counts = { total: qualifications.length, extracted: 0, reviewed: 0, verified: 0, requires_review: 0 };
    qualifications.forEach(q => {
      const st = q.verification_status || 'extracted';
      if (counts[st] !== undefined) counts[st]++;
      else counts.extracted++;
    });
    return counts;
  }, [qualifications]);

  // Filter qualifications list
  const filteredRecords = useMemo(() => {
    return qualifications.filter(q => {
      // 1. Search
      if (searchQuery) {
        const term = searchQuery.toLowerCase();
        const matchesTitle = q.title?.toLowerCase().includes(term);
        const matchesCode = q.code?.toLowerCase().includes(term);
        const matchesSector = q.sector?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesCode && !matchesSector) return false;
      }

      // 2. Source file
      if (selectedSource !== 'ALL' && q.source_file !== selectedSource) {
        return false;
      }

      // 3. Status
      const status = q.verification_status || 'extracted';
      if (selectedStatus !== 'ALL' && status !== selectedStatus) {
        return false;
      }

      // 4. Sector
      if (selectedSector !== 'ALL' && q.sector !== selectedSector) {
        return false;
      }

      // 5. NSQF Level
      if (selectedLevel !== 'ALL' && String(q.level) !== String(selectedLevel)) {
        return false;
      }

      // 6. Duration
      if (selectedDuration !== 'ALL') {
        const hStr = q.hours || q.max_notational_hours || q.min_notational_hours || '';
        const m = hStr.match(/(\d+)/);
        const hNum = m ? parseInt(m[1], 10) : 0;
        if (selectedDuration === 'short' && (hNum <= 0 || hNum > 120)) return false;
        if (selectedDuration === 'medium' && (hNum <= 120 || hNum > 500)) return false;
        if (selectedDuration === 'long' && hNum <= 500) return false;
      }

      return true;
    }).slice(0, 40); // Snappy pagination of top 40 results
  }, [
    qualifications, 
    searchQuery, 
    selectedSource, 
    selectedStatus, 
    selectedSector, 
    selectedLevel, 
    selectedDuration
  ]);

  // Open Flag Modal
  const handleOpenFlag = (record) => {
    setFlaggingRecord(record);
    setFlagReason(`Manual coordinator review requested for ${record.code || record.title} to verify source authenticity.`);
    setFlagSeverity('MEDIUM');
  };

  // Submit Flag
  const handleConfirmFlag = (e) => {
    e.preventDefault();
    if (!flaggingRecord) return;

    dataRepository.addReviewIssue({
      source_file: flaggingRecord.source_file || 'NQR_Qualifications_Summary.xlsx.xlsx',
      location: flaggingRecord.source_row ? `Worksheet Row ${flaggingRecord.source_row}` : 'Document Catalog',
      item_title: flaggingRecord.title || 'Untitled',
      item_code: flaggingRecord.code || 'No Code',
      issue_type: 'COORDINATOR_FLAGGED_REVIEW',
      details: flagReason,
      severity: flagSeverity
    });

    dataRepository.updateVerificationStatus(flaggingRecord.id, 'requires_review');
    setQualifications(dataRepository.getQualifications());
    setReviewIssues(dataRepository.getExtractionReviewIssues());
    setFlaggingRecord(null);
    showToast(`Flagged ${flaggingRecord.code || flaggingRecord.title} as Requires Review.`);
  };

  // Resolve Issue
  // Placeholder: window.prompt() blocked headless tests and is inaccessible.
  // TODO: replace with inline Modal collecting resolution notes (see Edit/Correction modal pattern).
  const handleResolveIssue = (issueId) => {
    const ok = window.confirm('Mark this audit discrepancy as resolved with the default verification note?');
    if (!ok) return;
    const note = 'Cross-referenced and verified against authoritative NCVET qualification document.';
    dataRepository.updateReviewIssueStatus(issueId, 'resolved', note);
    setReviewIssues(dataRepository.getExtractionReviewIssues());
    setQualifications(dataRepository.getQualifications());
    showToast('Audit discrepancy marked as resolved.');
  };

  // Open Edit Modal
  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setEditForm({
      title: record.title || '',
      code: record.code || '',
      level: record.level || record.raw_level || '',
      awarding_body: record.awarding_body || '',
      valid_till: record.valid_till || '',
      sector: record.sector || ''
    });
    setReviewStatus(record.verification_status === 'requires_review' ? 'reviewed' : (record.verification_status || 'reviewed'));
    setReviewNotes('');
  };

  // Save Correction
  const handleSaveCorrection = (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    dataRepository.correctQualification(
      editingRecord.id,
      editForm,
      reviewStatus,
      reviewNotes || 'Updated by Coordinator during source data review'
    );

    setQualifications(dataRepository.getQualifications());
    setEditingRecord(null);
    showToast(`Correction recorded for ${editingRecord.code || editingRecord.title}. Status: ${reviewStatus.toUpperCase()}`);
  };

  // Open Detail View Modal
  const handleOpenRecordDetail = (record) => {
    setViewingRecord(record);
    setViewingRecordTab('details');
  };

  // Filter Employability Skills modules & competencies for selected duration
  const activeEsModules = useMemo(() => {
    const currId = `CURR-ES-${selectedEsHours}H`;
    return modules.filter(m => m.curriculum_id === currId || m.duration_hours === selectedEsHours);
  }, [modules, selectedEsHours]);

  const activeEsCompetencies = useMemo(() => {
    const currId = `CURR-ES-${selectedEsHours}H`;
    return competencies.filter(c => c.curriculum_id === currId || c.duration_hours === selectedEsHours);
  }, [competencies, selectedEsHours]);

  // Check if a record has active issues
  const getIssuesForRecord = (record) => {
    if (!record) return [];
    return reviewIssues.filter(i => 
      (record.code && i.item_code === record.code) ||
      (record.title && i.item_title === record.title)
    );
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-indigo-500 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Excel Disclaimer Notice */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Source Data Pipeline & Governance
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {qualifications.length} Registered Qualifications
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Qualification & Curriculum Data Review
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit imported qualification records, inspect partitioned Employability Skills curricula, track extraction provenance, and record corrections.
            </p>
          </div>

          {/* 4 Distinct Verification Status Badges */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-[10px] flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-300">
              Extracted ({verificationCounts.extracted})
            </span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold border border-sky-300">
              Reviewed ({verificationCounts.reviewed})
            </span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Verified ({verificationCounts.verified})
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-300">
              Requires Review ({verificationCounts.requires_review})
            </span>
          </div>
        </div>

        {/* Regulatory Rule Callout: Excel Spreadsheet Presence != Verification */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <strong>Official Verification Standard:</strong> In compliance with NCVET RPL Guidelines, qualifications imported from the NQR spreadsheet (2,814 records) are classified as <strong>Extracted</strong> by default. An entry in the supplied Excel spreadsheet does <em>not</em> constitute official regulatory verification. Only records audited against authoritative Qualification Files or gazette notifications may be transitioned to <strong>Verified</strong>.
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'records' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Imported Qualifications ({qualifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('curricula')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'curricula' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Employability Skills Curricula (30h/60h/90h/120h)</span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'issues' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Flagged Issues ({reviewIssues.filter(i => i.status !== 'resolved').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sources' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Source Manifest ({sources.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: IMPORTED QUALIFICATIONS REGISTRY
      ========================================================================== */}
      {activeTab === 'records' && (
        <div className="space-y-3">
          
          {/* Multi-filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, code, or sector..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
              />
            </div>

            {/* Verification Status */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="extracted">Extracted</option>
                <option value="reviewed">Reviewed</option>
                <option value="verified">Verified</option>
                <option value="requires_review">Requires Review</option>
              </select>
            </div>

            {/* Sector */}
            <div>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Sectors</option>
                {distinctSectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* NSQF Level */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All NSQF Levels</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
                <option value="6">Level 6</option>
                <option value="7">Level 7</option>
                <option value="8">Level 8</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Durations</option>
                <option value="short">Short (≤ 120 Hours)</option>
                <option value="medium">Medium (121 - 500 Hours)</option>
                <option value="long">Long (&gt; 500 Hours)</option>
              </select>
            </div>

            {/* Source Document */}
            <div>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Sources</option>
                {sources.map(s => (
                  <option key={s.source_id} value={s.file_name}>{s.file_name}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Records List */}
          <div className="space-y-2">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r) => {
                const status = r.verification_status || 'extracted';
                const recordIssues = getIssuesForRecord(r);
                const hasIssues = recordIssues.length > 0 || status === 'requires_review';

                return (
                  <div
                    key={r.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900 text-xs sm:text-sm">{r.title}</strong>
                        <NsqfBadge level={r.level || r.raw_level || 'N/A'} />
                        {r.code && (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                            {r.code}
                          </span>
                        )}
                        {r.hours && (
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {r.hours}
                          </span>
                        )}
                        {r.is_corrected && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                            Correction Recorded
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Sector: <strong className="text-slate-700">{r.sector || 'General'}</strong> • Awarding Body: {r.awarding_body || 'Not Specified in Source'}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                        <span>Source: <strong>{r.source_file}</strong> ({r.source_row ? `Worksheet Row ${r.source_row}` : 'PDF Annexure'})</span>
                        {hasIssues && (
                          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Flagged Discrepancy
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : status === 'reviewed'
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : status === 'requires_review'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {status.replace('_', ' ')}
                      </span>

                      <button
                        onClick={() => handleOpenRecordDetail(r)}
                        title="Inspect full source traceability and performance criteria"
                        aria-label={`Inspect ${r.code || r.title}`}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenFlag(r)}
                        title="Flag for coordinator audit"
                        aria-label={`Flag ${r.code || r.title} for review`}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-500 hover:text-amber-700 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(r)}
                        title="Record a correction"
                        aria-label={`Record correction for ${r.code || r.title}`}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 font-bold text-[11px] px-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500">
                No qualifications match the active filter combination.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: EMPLOYABILITY SKILLS CURRICULA (30h, 60h, 90h, 120h DISTINCT)
      ========================================================================== */}
      {activeTab === 'curricula' && (
        <div className="space-y-4">
          
          {/* Isolation standard banner */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-sky-950 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-700" />
              <strong className="text-xs">Document Partitioning Guarantee:</strong>
            </div>
            <p className="text-[11px] leading-relaxed text-sky-900">
              The 30-, 60-, 90-, and 120-hour Employability Skills curricula were extracted from 4 distinct Model Curriculum PDF documents. 
              <strong> They are strictly partitioned and never merged</strong>, preserving separate module allocations, mark weightages, and learning outcomes for each training duration.
            </p>
          </div>

          {/* 4 Distinct Curriculum Duration Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { hours: 30, title: 'Foundation (30 Hours)', pdf: 'Employability_Skills_30_Hours.pdf.pdf', modules: 11, marks: 50, pages: 6 },
              { hours: 60, title: 'Intermediate (60 Hours)', pdf: 'Employability_Skills_60_Hours.pdf.pdf', modules: 12, marks: 50, pages: 7 },
              { hours: 90, title: 'Advanced (90 Hours)', pdf: 'Employability_Skills_90_Hours.pdf.pdf', modules: 12, marks: 50, pages: 7, code: 'DGT/VSQ/N0103' },
              { hours: 120, title: 'Comprehensive (120 Hours)', pdf: 'Employability_Skills_120_Hours.pdf.pdf', modules: 12, marks: '100%', pages: 8 }
            ].map(c => (
              <button
                key={c.hours}
                onClick={() => setSelectedEsHours(c.hours)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedEsHours === c.hours
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/40'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    selectedEsHours === c.hours ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {c.hours} Hours
                  </span>
                  <span className={`text-[10px] font-mono ${selectedEsHours === c.hours ? 'text-slate-400' : 'text-slate-400'}`}>
                    {c.pages} Pages
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm mt-2">{c.title}</h4>
                <p className={`text-[10px] mt-1 font-mono truncate ${selectedEsHours === c.hours ? 'text-slate-400' : 'text-slate-500'}`}>
                  {c.pdf}
                </p>
                <div className={`mt-2 pt-2 border-t flex justify-between text-[10px] ${
                  selectedEsHours === c.hours ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-500'
                }`}>
                  <span>{c.modules} Modules</span>
                  <span>Marks: {c.marks}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Selected Curriculum Inspection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Employability Skills ({selectedEsHours} Hours) • Model Curriculum
                </h3>
                <p className="text-[11px] text-slate-500">
                  Source: <strong>Employability_Skills_{selectedEsHours}_Hours.pdf.pdf</strong>
                  {selectedEsHours === 90 && ' (Associated with National Occupational Standard DGT/VSQ/N0103)'}
                </p>
              </div>

              <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                {activeEsModules.length} Modules Extracted
              </span>
            </div>

            {/* Modules Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Curriculum Modules & Assessment Weightages:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeEsModules.map((m, idx) => (
                  <div key={m.id || idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-slate-900 text-xs">
                        Module {m.module_number || idx + 1}: {m.name}
                      </strong>
                      <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border">
                        {m.allocated_hours} hrs
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Assessment Marks: <strong>{m.assessment_marks || 4}</strong></span>
                      <span className="font-mono text-slate-400">PDF Page {m.source?.page || 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competency Outcomes */}
            {activeEsCompetencies.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs">Extracted Learning Outcomes ({activeEsCompetencies.length}):</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeEsCompetencies.map((comp, idx) => (
                    <div key={comp.id || idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 text-[11px] text-slate-700 flex items-start gap-2">
                      <span className="font-mono text-[10px] text-indigo-600 font-bold flex-shrink-0">
                        LO-{idx + 1}
                      </span>
                      <span>{comp.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: FLAGGED DISCREPANCIES & ISSUES
      ========================================================================== */}
      {activeTab === 'issues' && (
        <div className="space-y-3">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Source Provenance Discrepancy Registry:</strong> Items flagged for manual coordinator resolution. Includes duplicate qualification codes in spreadsheet, character encoding artifacts, and qualifications missing in catalog but present in regulatory PDFs.
            </div>
          </div>

          <div className="space-y-2.5">
            {reviewIssues.map((issue) => (
              <div key={issue.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      issue.severity === 'HIGH' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {issue.issue_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{issue.severity} Priority</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{issue.id}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">
                  {issue.item_title} ({issue.item_code})
                </h4>

                <p className="text-slate-600 text-xs leading-relaxed">{issue.details}</p>

                {issue.resolution_notes && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-900 text-[11px]">
                    <strong>Resolution Note:</strong> {issue.resolution_notes}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Source: <strong>{issue.source_file}</strong> ({issue.location})</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 uppercase font-mono text-[10px]">
                      Status: {issue.status}
                    </span>
                    {issue.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolveIssue(issue.id)}
                        className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SOURCE MANIFEST
      ========================================================================== */}
      {activeTab === 'sources' && (
        <div className="space-y-2.5">
          {sources.map((s) => (
            <div key={s.source_id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{s.file_name}</span>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                  {s.document_type}
                </span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{s.notes}</p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                <span>Scope: <strong>{s.records_count ? `${s.records_count} Records` : `${s.pages_count} Pages`}</strong></span>
                <span>Verification State: <strong className="uppercase text-slate-700">{s.status}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL: DETAILED RECORD VIEW & CITATION INSPECTOR
      ========================================================================== */}
      {viewingRecord && (
        <Modal
          isOpen={true}
          onClose={() => setViewingRecord(null)}
          title={`Qualification Inspection • ${viewingRecord.code || viewingRecord.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800 font-mono">
                  {viewingRecord.code || 'NO-CODE'}
                </span>
                <NsqfBadge level={viewingRecord.level || viewingRecord.raw_level || 'N/A'} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  viewingRecord.verification_status === 'verified'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  {viewingRecord.verification_status || 'Extracted'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{viewingRecord.title}</h3>
              <p className="text-xs text-slate-300">
                Sector: <strong>{viewingRecord.sector || 'General'}</strong> • Awarding Body: {viewingRecord.awarding_body || 'Not Specified'}
              </p>
            </div>

            {/* Sub-tabs inside Detail Modal */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewingRecordTab('details')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  viewingRecordTab === 'details' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Provenance & Traceability
              </button>
              <button
                onClick={() => setViewingRecordTab('criteria')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  viewingRecordTab === 'criteria' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Performance Criteria ({performanceCriteria.filter(pc => pc.qualification_code === viewingRecord.code).length})
              </button>
              <button
                onClick={() => setViewingRecordTab('assessment')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  viewingRecordTab === 'assessment' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Assessment Methods
              </button>
              {viewingRecord.is_corrected && (
                <button
                  onClick={() => setViewingRecordTab('history')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    viewingRecordTab === 'history' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Correction History
                </button>
              )}
            </div>

            {/* Detail Tab 1: Provenance */}
            {viewingRecordTab === 'details' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Source File</span>
                    <strong className="text-slate-900">{viewingRecord.source_file}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Worksheet / Page Reference</span>
                    <strong className="text-slate-900">
                      {viewingRecord.source_row ? `Worksheet Row ${viewingRecord.source_row}` : 'Document Catalog'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Validity Date</span>
                    <strong className="text-slate-900">{viewingRecord.valid_till || 'Not Specified'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Notational Duration</span>
                    <strong className="text-slate-900">{viewingRecord.hours || 'Unspecified'}</strong>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Source Occupational Summary:</span>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {viewingRecord.desc_snippet || viewingRecord.description || 'No summary text populated in source export.'}
                  </p>
                </div>
              </div>
            )}

            {/* Detail Tab 2: Performance Criteria */}
            {viewingRecordTab === 'criteria' && (
              <div className="space-y-2">
                {(() => {
                  const pcs = performanceCriteria.filter(pc => pc.qualification_code === viewingRecord.code);
                  if (pcs.length === 0) {
                    return (
                      <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500">
                        <p>No individual performance criteria mapped directly to code {viewingRecord.code}.</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Full 146 performance criteria are available on code <strong>2022/OAFM/MEPSC/06022</strong> (from Assessment Guide PDF).
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {pcs.map((pc, idx) => (
                        <div key={pc.id || idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-start gap-2">
                          <span className="font-mono text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border flex-shrink-0">
                            {pc.pc_code}
                          </span>
                          <span className="text-slate-700 leading-relaxed">{pc.description}</span>
                          <span className="text-[10px] font-mono text-slate-400 ml-auto flex-shrink-0">
                            Page {pc.source?.page}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Detail Tab 3: Assessment Methods */}
            {viewingRecordTab === 'assessment' && (
              <div className="space-y-3">
                <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-2xl space-y-1 text-teal-950">
                  <h4 className="font-bold text-xs">Summative vs Practical Examination Standard</h4>
                  <p className="text-[11px] leading-relaxed text-teal-900">
                    40% Summative Written Theory (MCQs & Pictorial Items) : 60% Practical Demonstration & Situational Oral Viva.
                    Passing threshold is 70% aggregate.
                  </p>
                </div>

                <div className="space-y-2">
                  {assessmentMethods.map((am, idx) => (
                    <div key={am.id || idx} className="bg-white border border-slate-200 p-3 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-900 text-xs">{am.method_name}</strong>
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {am.weightage}% Weightage
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{am.format}</p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Source: {am.source?.source_file} (Page {am.source?.page})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detail Tab 4: Correction History */}
            {viewingRecordTab === 'history' && viewingRecord.is_corrected && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-900">
                  <History className="w-4 h-4 text-amber-700" />
                  <strong className="text-xs">Original Provenance vs Coordinator Correction:</strong>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Original Extracted Value (from Source)
                    </span>
                    <p>Title: <strong>{viewingRecord.original_values?.title || 'N/A'}</strong></p>
                    <p>Code: <strong className="font-mono">{viewingRecord.original_values?.code || 'N/A'}</strong></p>
                    <p>Level: <strong>{viewingRecord.original_values?.level || 'N/A'}</strong></p>
                    <p>Awarding Body: <strong>{viewingRecord.original_values?.awarding_body || 'N/A'}</strong></p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block mb-1">
                      Corrected Value (Coordinator Override)
                    </span>
                    <p>Title: <strong>{viewingRecord.title}</strong></p>
                    <p>Code: <strong className="font-mono">{viewingRecord.code}</strong></p>
                    <p>Level: <strong>{viewingRecord.level}</strong></p>
                    <p>Awarding Body: <strong>{viewingRecord.awarding_body}</strong></p>
                    <p className="text-[10px] text-slate-500 mt-1">Notes: "{viewingRecord.correction_notes}"</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingRecord(null)}
              >
                Close Inspection
              </Button>
            </div>

          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL: EDIT / CORRECT RECORD (PRESERVES RAW PROVENANCE)
      ========================================================================== */}
      {editingRecord && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRecord(null)}
          title={`Correct Metadata • ${editingRecord.code || editingRecord.title}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveCorrection} className="space-y-3.5 text-xs">
            <p className="text-slate-500 text-[11px]">
              Raw extracted values will be preserved in the audit history. Corrections will be linked with coordinator timestamps.
            </p>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Qualification Title:</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Qualification Code:</label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">NSQF Level:</label>
                <input
                  type="text"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Awarding Body:</label>
              <input
                type="text"
                value={editForm.awarding_body}
                onChange={(e) => setEditForm({ ...editForm, awarding_body: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Valid Till Date:</label>
              <input
                type="text"
                value={editForm.valid_till}
                onChange={(e) => setEditForm({ ...editForm, valid_till: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Updated Verification Status:</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="reviewed">Reviewed (Audited by Coordinator)</option>
                <option value="verified">Verified (Cross-checked against Official Gazette)</option>
                <option value="requires_review">Requires Review (Flagged for Further Audit)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Audit Notes / Rationale:</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Reason for correction and reference document used..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingRecord(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Save}
              >
                Save Correction
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL: FLAG RECORD FOR MANUAL REVIEW
      ========================================================================== */}
      {flaggingRecord && (
        <Modal
          isOpen={true}
          onClose={() => setFlaggingRecord(null)}
          title={`Flag for Audit • ${flaggingRecord.code || flaggingRecord.title}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmFlag} className="space-y-3.5 text-xs">
            <p className="text-slate-600 text-xs leading-relaxed">
              Flagging this qualification will mark its verification status as <strong>Requires Review</strong> and append an entry to the Audit Discrepancy Registry.
            </p>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Discrepancy / Review Reason:</label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Severity Level:</label>
              <select
                value={flagSeverity}
                onChange={(e) => setFlagSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="LOW">Low (Minor Typo / Formatting)</option>
                <option value="MEDIUM">Medium (Missing Expiration / Ambiguous Body)</option>
                <option value="HIGH">High (Duplicate Code / Catalog Conflict)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFlaggingRecord(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Flag}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Confirm Flag
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
