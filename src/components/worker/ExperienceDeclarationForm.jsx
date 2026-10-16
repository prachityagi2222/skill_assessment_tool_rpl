import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Sparkles, Check, AlertCircle, ArrowLeft, ArrowRight, Save, Lightbulb, Wrench, Clock, FileCheck, Mic, Volume2, VolumeX, Shield, Info } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { VoiceExperienceModal } from './VoiceExperienceModal';
import { textToSpeechService } from '../../services/textToSpeechService';

export const ExperienceDeclarationForm = ({
  declaredSkills = [],
  onUpdateSkills,
  onNext,
  onBack,
  onSaveDraft
}) => {
  const { language, t } = useLanguage();
  const [skillTitle, setSkillTitle] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [frequency, setFrequency] = useState('Daily / Regular Work');
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [globalError, setGlobalError] = useState('');

  // Voice & TTS State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [ttsNotice, setTtsNotice] = useState('');

  // Clean up any ongoing TTS on unmount
  useEffect(() => {
    return () => {
      textToSpeechService.stop();
    };
  }, []);

  // Suggested Examples (clearly marked as examples)
  const SUGGESTED_EXAMPLES = [
    {
      trade: "Electrical Installation",
      tag: "Example: Electrical",
      title: "Three-Phase MCB Panel Dressing & Earthing Check",
      tools: "Neon tester, digital multimeter, wire stripper, comb busbar, insulated pliers",
      desc: "Isolate incoming 415V supply with main switch. Mount 40A RCCB and 16A MCBs on DIN rail. Dress phase lines with 4 sq mm copper cables and verify earthing pit resistance below 3 ohms."
    },
    {
      trade: "Tailoring & Garments",
      tag: "Example: Tailoring",
      title: "Garment Pattern Drafting, Machine Stitching & Overlock",
      tools: "Industrial single needle sewing machine, tailor's chalk, shears, measuring tape, steam iron",
      desc: "Take body measurements, draft paper patterns for kurtas/shirts, cut fabric keeping seam allowances, stitch collar and plackets, and complete neat overlock finishing on raw edges."
    },
    {
      trade: "Welding & Fabrication",
      tag: "Example: Welding",
      title: "Automotive Exhaust Pipe MIG/TIG Butt & Fillet Welding",
      tools: "TIG torch WP-17, argon cylinder with flowmeter, auto-darkening helmet (DIN 11), angle grinder",
      desc: "Clean steel pipe edges to remove rust and oil. Set argon shielding gas to 10-12 L/min. Deposit uniform weld bead with full root penetration without spatter or burn-through."
    },
    {
      trade: "Healthcare Caregiving",
      tag: "Example: Healthcare",
      title: "Vital Signs Recording & Safe Patient Bed Transfer",
      tools: "Digital blood pressure cuff, pulse oximeter, clinical thermometer, patient transfer belt",
      desc: "Position patient comfortably at rest for 5 minutes, record BP and SpO2 readings accurately, dispose used gloves in red biomedical waste bin, and perform 2-person ergonomic transfer."
    }
  ];

  const handleApplyExample = (example) => {
    setSkillTitle(example.title);
    setToolsUsed(example.tools);
    setTaskDescription(example.desc);
    setFormError('');
  };

  const handleAddOrUpdateSkill = (e) => {
    e.preventDefault();
    if (!skillTitle.trim()) {
      setFormError(language === 'hi' ? 'कृपया कार्य या कौशल का नाम दर्ज करें।' : 'Please enter a task or skill title.');
      return;
    }
    if (!taskDescription.trim()) {
      setFormError(language === 'hi' ? 'कृपया कार्य के चरण या प्रक्रिया का विवरण दें।' : 'Please describe the work steps or tasks you perform.');
      return;
    }

    if (editingId) {
      // Update existing
      const updated = declaredSkills.map(s => {
        if (s.id === editingId) {
          return {
            ...s,
            title: skillTitle.trim(),
            tools: toolsUsed.trim() || (language === 'hi' ? 'हस्त औजार' : 'Hand tools'),
            description: taskDescription.trim(),
            frequency
          };
        }
        return s;
      });
      onUpdateSkills(updated);
      setEditingId(null);
    } else {
      // Add new
      const newSkill = {
        id: `skill-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now())}`,
        title: skillTitle.trim(),
        tools: toolsUsed.trim() || (language === 'hi' ? 'हस्त औजार' : 'Hand tools'),
        description: taskDescription.trim(),
        frequency
      };
      onUpdateSkills([...declaredSkills, newSkill]);
    }

    // Reset inputs
    setSkillTitle('');
    setToolsUsed('');
    setTaskDescription('');
    setFormError('');
    setGlobalError('');
  };

  const handleEdit = (skill) => {
    setEditingId(skill.id);
    setSkillTitle(skill.title);
    setToolsUsed(skill.tools);
    setTaskDescription(skill.description);
    setFrequency(skill.frequency || (language === 'hi' ? 'दैनिक / नियमित कार्य' : 'Daily / Regular Work'));
    setFormError('');
  };

  const handleDelete = (id) => {
    onUpdateSkills(declaredSkills.filter(s => s.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setSkillTitle('');
      setToolsUsed('');
      setTaskDescription('');
    }
  };

  const handleContinue = () => {
    if (declaredSkills.length === 0) {
      setGlobalError(t('minSkillsRequiredError'));
      return;
    }
    onNext();
  };

  // Toggle Read Aloud for Instructions (Phase 3)
  const handleToggleReadAloud = () => {
    setTtsNotice('');
    if (isReadingAloud) {
      textToSpeechService.stop();
      setIsReadingAloud(false);
      return;
    }

    // Instructions only - never reads sensitive applicant details
    const instructionsText = language === 'hi'
      ? 'चरण दो: कार्य अनुभव घोषणा। अपने दैनिक कार्यों, उपयोग किए जाने वाले औजारों और सुरक्षा सावधानियों का विवरण दें। आप उदाहरण चुन सकते हैं, कीबोर्ड से टाइप कर सकते हैं, या माइक दबाकर बोल सकते हैं। काम पूरा होने पर कौशल जोड़ें।'
      : 'Step 2: Experience Declaration. Describe the practical tasks you perform at work. You can select an example, type using your keyboard, or tap the microphone to speak your experience. Once added, your skills will be matched to national standards.';

    const started = textToSpeechService.speak(instructionsText, {
      language,
      onStart: () => setIsReadingAloud(true),
      onEnd: () => setIsReadingAloud(false),
      onError: (err) => {
        setIsReadingAloud(false);
        setTtsNotice(err.code === 'UNSUPPORTED' ? t('ttsUnsupportedNotice') : t('ttsNoVoiceNotice'));
      }
    });

    if (!started && !textToSpeechService.isSupported()) {
      setTtsNotice(t('ttsUnsupportedNotice'));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
      
      {/* Header with Title and Read Aloud Button */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {t('step2Skills')} • {t('experienceHeaderTitle')}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {t('experienceHeaderTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('experienceHeaderSubtitle')}
          </p>
        </div>

        {/* Read Aloud Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleToggleReadAloud}
            className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              isReadingAloud
                ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200 animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            aria-label={isReadingAloud ? t('stopReadingBtn') : t('readAloudBtn')}
            title={isReadingAloud ? t('stopReadingBtn') : t('readAloudBtn')}
          >
            {isReadingAloud ? (
              <VolumeX className="w-4 h-4 text-rose-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-600" />
            )}
            <span>{isReadingAloud ? t('stopReadingBtn') : t('readAloudBtn')}</span>
          </button>
        </div>
      </div>

      {ttsNotice && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>{ttsNotice}</span>
          <button
            type="button"
            onClick={() => setTtsNotice('')}
            className="text-[10px] text-amber-900 underline ml-2"
          >
            {t('close')}
          </button>
        </div>
      )}

      {/* Suggested Examples Section (Clearly Marked as Examples) */}
      <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>{t('suggestedExamplesTitle')}</span>
        </div>
        <p className="text-[11px] text-slate-500">
          {t('suggestedExamplesHelper')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {SUGGESTED_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyExample(ex)}
              className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 bg-white transition-all text-xs group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                  {ex.tag}
                </span>
                <span className="text-[10px] text-teal-600 font-semibold group-hover:underline">
                  {t('loadExampleBtn')}
                </span>
              </div>
              <p className="font-semibold text-slate-800 text-xs truncate">
                {ex.title}
              </p>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {t('toolsUsedLabel')}: {ex.tools}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Skill Sub-Form */}
      <form onSubmit={handleAddOrUpdateSkill} className="bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-teal-600" />
            {editingId ? t('editSkillFormTitle') : t('addSkillFormTitle')}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setSkillTitle('');
                setToolsUsed('');
                setTaskDescription('');
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline"
            >
              {t('cancelEditBtn')}
            </button>
          )}
        </div>

        {/* Task Title */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            {t('taskNameLabel')} <span className="text-rose-500">{t('requiredStar')}</span>
          </label>
          <input
            type="text"
            value={skillTitle}
            onChange={(e) => setSkillTitle(e.target.value)}
            placeholder={t('taskNamePlaceholder')}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Tools Used */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              {t('toolsUsedLabel')}
            </label>
            <input
              type="text"
              value={toolsUsed}
              onChange={(e) => setToolsUsed(e.target.value)}
              placeholder={t('toolsUsedPlaceholder')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              {t('frequencyLabel')}
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="Daily / Regular Work">{t('frequencyDaily')}</option>
              <option value="Weekly Projects">{t('frequencyWeekly')}</option>
              <option value="Specialized / As Required">{t('frequencySpecialized')}</option>
            </select>
          </div>
        </div>

        {/* Detailed Task Description with Voice Button */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className="text-xs font-bold text-slate-800">
              {t('taskStepsLabel')} <span className="text-rose-500">{t('requiredStar')}</span>
            </label>

            {/* Optional Voice Input Button */}
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border border-teal-200 text-teal-800 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
              aria-label={t('voiceBtnLabel')}
              title="Speak your experience (optional)"
            >
              <Mic className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{t('voiceBtnLabel')}</span>
              <span className="text-[9px] bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded font-normal">
                {t('optionalBadge')}
              </span>
            </button>
          </div>

          <textarea
            rows="3"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder={t('taskStepsPlaceholder')}
            className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            {t('voiceInputOptionalBanner')}
          </p>
        </div>

        {formError && (
          <p className="text-rose-600 text-xs flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {formError}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            icon={editingId ? Check : Plus}
          >
            {editingId ? t('updateSkillBtn') : t('addSkillBtn')}
          </Button>
        </div>
      </form>

      {/* Official Standards Grounding Disclaimer */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{t('criteriaLanguageDisclaimer')}</span>
      </div>

      {/* List of Declared Skills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t('declaredSkillsTitle')} ({declaredSkills.length})
          </h3>
          {declaredSkills.length > 0 && (
            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Ready for Evidence Mapping
            </span>
          )}
        </div>

        {declaredSkills.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-500">
            <FileCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">{t('noSkillsDeclared')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'hi' ? 'ऊपर दिए गए फॉर्म से लिखें या माइक से बोलकर जोड़ें।' : 'Type above or use the microphone to add your practical skills.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {declaredSkills.map((sk) => (
              <div
                key={sk.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {sk.title}
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium whitespace-nowrap">
                      {sk.frequency}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed mt-1">
                    {sk.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                    <Wrench className="w-3 h-3 text-slate-400" />
                    <strong>{t('toolsUsedLabel')}:</strong> {sk.tools}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleEdit(sk)}
                    className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-teal-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> {t('edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sk.id)}
                    className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {globalError && (
          <p className="text-rose-600 text-xs flex items-center gap-1.5 font-medium p-2.5 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {globalError}
          </p>
        )}
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
            onClick={handleContinue}
            icon={ArrowRight}
            className="flex-1 sm:flex-none"
          >
            {t('nextStep')}: {t('step3Matching')}
          </Button>
        </div>
      </div>

      {/* Voice Experience Modal */}
      <VoiceExperienceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyTranscript={(transcript) => {
          setTaskDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
          setFormError('');
        }}
      />

    </div>
  );
};
