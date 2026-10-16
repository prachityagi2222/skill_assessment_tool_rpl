import React, { useState, useEffect } from 'react';
import { Camera, FileText, Upload, Trash2, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Sparkles, ArrowLeft, ArrowRight, Save, Plus, Image as ImageIcon, Volume2, HardDrive, Info } from 'lucide-react';
import { Button } from '../common/Button';
import { validateEvidenceFile } from '../../services/offlineDb';
import { useLanguage } from '../../context/LanguageContext';

export const EvidenceUploadSection = ({
  evidenceList = [],
  declaredSkills = [],
  onUpdateEvidence,
  onNext,
  onBack,
  onSaveDraft
}) => {
  const { language, t } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [evidenceType, setEvidenceType] = useState('Photo of Completed Work');
  const [relatedSkill, setRelatedSkill] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFilePreset, setSelectedFilePreset] = useState('p1');
  const [customFile, setCustomFile] = useState(null);
  const [formError, setFormError] = useState('');

  // Sample presets for quick testing on desktop & mobile
  const SAMPLE_PRESETS = [
    {
      id: 'p1',
      name: 'Distribution_Panel_Wiring.jpg',
      size: '2.4 MB',
      type: 'Photo of Completed Work',
      url: './assets/placeholder-evidence.svg',
      description: 'Three-phase 40A RCCB and 16A MCB sub-distribution panel with color-coded copper wiring.',
      defaultSkill: 'Three-Phase MCB Panel Dressing'
    },
    {
      id: 'p2',
      name: 'Earthing_Resistance_Multimeter_Test.jpg',
      size: '1.8 MB',
      type: 'Photo of Completed Work',
      url: './assets/placeholder-evidence.svg',
      description: 'Digital multimeter measurement of loop continuity and earth pit reading (2.8 ohms).',
      defaultSkill: 'Earthing Pit Resistance Testing'
    },
    {
      id: 'p3',
      name: 'TIG_Weld_Manifold_Joint.jpg',
      size: '3.1 MB',
      type: 'Photo of Completed Work',
      url: './assets/placeholder-evidence.svg',
      description: 'Stainless steel exhaust flange weld showing root penetration and argon gas shielding.',
      defaultSkill: 'Automotive TIG Butt & Fillet Welding'
    },
    {
      id: 'p4',
      name: 'Contractor_Experience_Letter.pdf',
      size: '410 KB',
      type: 'Employer / Contractor Reference Letter',
      url: null,
      description: 'Signed letter from local electrical contractor certifying 4 years of residential wiring work.',
      defaultSkill: 'Residential Wiring & Repairs'
    }
  ];

  const handleCustomFileChange = (e) => {
    setFormError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateEvidenceFile(file, file.name);
    if (!validation.valid) {
      setFormError(validation.error || t('fileSizeLimitError'));
      setCustomFile(null);
      e.target.value = '';
      return;
    }

    if (customFile?.url && customFile.url.startsWith('blob:')) {
      URL.revokeObjectURL(customFile.url);
    }
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setCustomFile({
      name: file.name,
      size: validation.readableSize,
      url: preview,
      type: file.type.startsWith('image/')
        ? 'Photo of Completed Work'
        : (file.type.startsWith('audio/') ? 'Voice Audio Narrative' : 'Employer / Contractor Reference Letter')
    });
    if (!description) {
      setDescription(`Field upload artifact: ${file.name}`);
    }
  };

  // Revoke any blob preview on unmount to avoid object-URL leaks.
  useEffect(() => {
    return () => {
      if (customFile?.url && customFile.url.startsWith('blob:')) {
        try { URL.revokeObjectURL(customFile.url); } catch {}
      }
    };
  }, [customFile]);

  const handleSelectPreset = (p) => {
    setCustomFile(null);
    setSelectedFilePreset(p.id);
    setEvidenceType(p.type);
    setDescription(p.description);
    if (!relatedSkill && declaredSkills.length > 0) {
      setRelatedSkill(declaredSkills[0].title);
    }
  };

  const handleAddEvidence = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError(language === 'hi' ? 'कृपया इस साक्ष्य का संक्षिप्त विवरण अवश्य लिखें।' : 'Please enter a short description of what this evidence shows.');
      return;
    }

    let fileName, fileSize, fileUrl;
    if (customFile) {
      fileName = customFile.name;
      fileSize = customFile.size;
      fileUrl = customFile.url;
    } else {
      const preset = SAMPLE_PRESETS.find(p => p.id === selectedFilePreset) || SAMPLE_PRESETS[0];
      // Route presets through the same validator (parse '2.4 MB'/'410 KB' to bytes).
      const sizeMatch = String(preset.size || '').match(/([\d.]+)\s*(MB|KB)/i);
      const presetBytes = sizeMatch
        ? Math.round(parseFloat(sizeMatch[1]) * (sizeMatch[2].toUpperCase() === 'MB' ? 1024 * 1024 : 1024))
        : 0;
      const presetCheck = validateEvidenceFile(
        { size: presetBytes, name: preset.name, type: preset.url ? 'image/jpeg' : 'application/pdf' },
        preset.name
      );
      if (!presetCheck.valid) {
        setFormError(presetCheck.error);
        return;
      }
      fileName = preset.name;
      fileSize = preset.size;
      fileUrl = preset.url;
    }

    const isLocalArtifact = !fileUrl || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:') || fileUrl.startsWith('./');
    const newEvidence = {
      id: `ev-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now())}`,
      fileName,
      fileSize,
      type: evidenceType,
      relatedSkill: relatedSkill || (declaredSkills[0]?.title || 'General Trade Competency'),
      description: description.trim(),
      url: fileUrl,
      uploadDate: new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      verificationStatus: 'Pending Review', // Never claim authentic on upload!
      offlineStored: isLocalArtifact,
      aiDetectedSignals: ['Tool usage visual match', 'Work area safety check queued']
    };

    onUpdateEvidence([newEvidence, ...evidenceList]);
    if (customFile?.url && customFile.url.startsWith('blob:')) {
      try { URL.revokeObjectURL(customFile.url); } catch {}
    }
    setShowAddForm(false);
    setCustomFile(null);
    setDescription('');
    setFormError('');
  };

  const handleDeleteEvidence = (id) => {
    const target = evidenceList.find(e => e.id === id);
    if (target?.url && target.url.startsWith('blob:')) {
      try { URL.revokeObjectURL(target.url); } catch {}
    }
    onUpdateEvidence(evidenceList.filter(e => e.id !== id));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {language === 'hi' ? 'परीक्षक द्वारा सत्यापित' : 'Verified by Assessor'}
          </span>
        );
      case 'Review Required':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {language === 'hi' ? 'पुनः समीक्षा आवश्यक' : 'Review Required'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-slate-500" />
            {language === 'hi' ? 'समीक्षाधीन (जांच बाकी)' : 'Pending Review'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {t('step4Evidence')} • {t('evidenceHeaderTitle')}
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          {t('evidenceHeaderTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('evidenceHeaderSubtitle')}
        </p>
      </div>

      {/* Human-In-The-Loop Mandatory Disclaimer */}
      <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold text-amber-900 block mb-0.5">
            {language === 'hi' ? 'सत्यापन प्रोटोकॉल सूचना:' : 'Verification Protocol Notice:'}
          </strong>
          {t('evidenceVerificationNotice')}
        </div>
      </div>

      {/* Upload Toggle Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {t('evidenceAttachedCount', { count: evidenceList.length })}
        </h3>
        <Button
          variant={showAddForm ? "outline" : "primary"}
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          icon={showAddForm ? null : Plus}
        >
          {showAddForm ? t('cancel') : t('addEvidenceBtn')}
        </Button>
      </div>

      {/* Add Evidence Form */}
      {showAddForm && (
        <form onSubmit={handleAddEvidence} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200 text-xs">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-teal-600" />
            {t('addEvidenceBtn')}
          </h4>

          {/* Direct File Picker with 5 MB Limit Notice */}
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('deviceUploadLabel')}</span>
              </label>
              <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">
                {t('deviceUploadNotice')}
              </span>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf,audio/*"
              onChange={handleCustomFileChange}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
            {customFile && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] bg-teal-50/70 text-teal-900 px-2 py-1 rounded-lg">
                <span>Selected: <strong>{customFile.name}</strong> ({customFile.size})</span>
                <button type="button" onClick={() => setCustomFile(null)} className="text-teal-600 font-bold hover:underline">{t('clear')}</button>
              </div>
            )}
          </div>

          {/* Quick Preset Selector */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t('presetEvidenceLabel')}:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedFilePreset === p.id
                      ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-500/20 font-bold'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {p.url ? <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> : <FileText className="w-3.5 h-3.5 text-sky-600" />}
                    <span className="text-[10px] text-slate-400">{p.size}</span>
                  </div>
                  <p className="text-[11px] truncate leading-tight">{p.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Evidence Type & Related Skill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                {t('evidenceTypeLabel')} <span className="text-rose-500">{t('requiredStar')}</span>
              </label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Photo of Completed Work">{t('evidenceTypePhoto')}</option>
                <option value="Voice Audio Narrative">{t('evidenceTypeAudio')}</option>
                <option value="Employer / Contractor Reference Letter">{t('evidenceTypeLetter')}</option>
                <option value="Client Invoice or Receipt">{t('evidenceTypeReceipt')}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                {t('relatedSkillLabel')}
              </label>
              <select
                value={relatedSkill}
                onChange={(e) => setRelatedSkill(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {declaredSkills.length > 0 ? (
                  declaredSkills.map(s => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))
                ) : (
                  <option value="General Trade Competence">{language === 'hi' ? 'सामान्य व्यावसायिक कौशल' : 'General Trade Competence'}</option>
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t('evidenceDescLabel')} <span className="text-rose-500">{t('requiredStar')}</span>
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('evidenceDescPlaceholder')}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {formError && (
            <p className="text-rose-600 text-xs flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={Upload}
            >
              {t('confirm')}
            </Button>
          </div>
        </form>
      )}

      {/* Evidence Cards List */}
      <div className="space-y-3">
        {evidenceList.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-500">
            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">{t('noEvidenceAttached')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'hi' ? 'ऊपर साक्ष्य जोड़ें बटन दबाकर काम के फोटो या पत्र संलग्न करें।' : 'Tap Add Work Evidence above to attach work photos, letters, or voice notes.'}
            </p>
          </div>
        ) : (
          evidenceList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 text-xs shadow-2xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row gap-3.5 items-start"
            >
              {/* Thumbnail or Icon Preview */}
              {item.url ? (
                <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  <img
                    src={item.url}
                    alt={item.fileName || "Evidence preview"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full sm:w-24 h-24 rounded-xl bg-slate-100 flex-shrink-0 border border-slate-200 flex flex-col items-center justify-center text-slate-500 text-center p-2">
                  <FileText className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[9px] font-semibold truncate max-w-full">Document</span>
                </div>
              )}

              {/* Info Details */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {item.fileName || item.title || "Work Evidence Artifact"}
                  </h4>
                  {getStatusBadge(item.verificationStatus || 'Pending Review')}
                </div>

                <p className="text-[11px] text-teal-800 font-semibold mb-1">
                  {t('relatedSkillLabel')}: {item.relatedSkill || "General Trade Competency"}
                </p>

                <p className="text-slate-600 text-xs leading-relaxed mb-2">
                  {item.description || item.qualityAssessment || "Candidate work artifact submitted for practical examination."}
                </p>

                {/* Verification Notice Disclaimer on every item */}
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{language === 'hi' ? 'अपलोड:' : 'Uploaded:'} {item.uploadDate || item.date || "Recent"} • {item.fileSize || "1.5 MB"}</span>
                  <span className="text-slate-400">{language === 'hi' ? 'परीक्षा में परीक्षक द्वारा जांच होगी' : 'Not verified until practical exam'}</span>
                </div>
              </div>

              {/* Delete Action */}
              <button
                type="button"
                onClick={() => handleDeleteEvidence(item.id)}
                className="self-end sm:self-start p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove evidence"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Official Standards Grounding Disclaimer */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{t('criteriaLanguageDisclaimer')}</span>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100">
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          icon={ArrowLeft}
          className="w-full sm:w-auto"
        >
          {t('backStep')}
        </Button>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={onSaveDraft}
            icon={Save}
            className="flex-1 sm:flex-none"
          >
            {t('saveDraft')}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onNext}
            icon={ArrowRight}
            className="flex-1 sm:flex-none"
          >
            {t('nextStep')}: {t('step5Summary')}
          </Button>
        </div>
      </div>

    </div>
  );
};
