import React, { useState } from 'react';
import { CheckCircle2, Edit3, Send, ArrowLeft, Save, Sparkles, ShieldCheck, User, Briefcase, Calendar, FileText, Camera, AlertCircle, Info } from 'lucide-react';
import { Button } from '../common/Button';
import { HumanInTheLoopBanner } from '../common/HumanInTheLoopBanner';
import { useLanguage } from '../../context/LanguageContext';

export const ApplicationSummaryView = ({
  formData,
  declaredSkills = [],
  evidenceList = [],
  onEditSection,
  onSubmitApplication,
  onBack,
  onSaveDraft
}) => {
  const { language, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalConsent, setFinalConsent] = useState(true);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (!finalConsent) {
      setSubmitError(
        language === 'hi'
          ? 'कृपया आवेदन जमा करने से पहले अंतिम स्व-घोषणा की पुष्टि करें।'
          : 'Please confirm the final certification declaration before submitting.'
      );
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitApplication();
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {t('step5Summary')} • {t('summaryHeaderTitle')}
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          {t('summaryHeaderTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('summaryHeaderSubtitle')}
        </p>
      </div>

      {/* Human-in-the-loop guarantee reminder */}
      <HumanInTheLoopBanner compact />

      {/* Section 1: Profile & Trade Overview */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
            <User className="w-4 h-4 text-teal-600" />
            {t('summaryWorkerProfileCard')}
          </h3>
          <button
            type="button"
            onClick={() => onEditSection(1)}
            className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-lg hover:border-teal-400 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> {t('edit')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('fullNameLabel')}</span>
            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">{formData.fullName || "Ramesh Kumar"}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('tradeLabel')}</span>
            <p className="font-bold text-teal-900 text-xs sm:text-sm mt-0.5">{formData.trade || "Domestic Electrician"}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('yearsExpLabel')}</span>
            <p className="font-medium text-slate-800 mt-0.5">{formData.yearsExperience || 6} {language === 'hi' ? 'वर्ष' : 'Years'}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('language')}</span>
            <p className="font-medium text-slate-800 mt-0.5">{formData.preferredLanguage === 'hi' ? 'हिन्दी (Hindi)' : 'English'}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('trainingBackgroundLabel')}</span>
            <p className="font-medium text-slate-800 mt-0.5 truncate">{formData.previousTraining || (language === 'hi' ? 'अनौपचारिक शागिर्दी' : 'Informal apprenticeship')}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('locationLabel')}</span>
            <p className="font-medium text-slate-800 mt-0.5">{formData.location || "Lucknow, UP"} {formData.phone ? `(${formData.phone})` : ''}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('workActivitiesLabel')}</span>
          <p className="text-slate-700 mt-1 leading-relaxed">{formData.workActivities || "Residential wiring, MCB distribution board, earthing resistance testing."}</p>
        </div>
      </div>

      {/* Section 2: Target Qualification Pack (Source Grounded - Official Criteria Preserved) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            {language === 'hi' ? 'लक्ष्य योग्यता पैक (QP)' : 'Target Qualification Pack'}
          </h3>
          <button
            type="button"
            onClick={() => onEditSection(3)}
            className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-lg hover:border-teal-400 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> {t('edit')}
          </button>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              {formData.selectedQualification?.title || formData.trade || 'Domestic Electrician'}
            </h4>
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
              {formData.selectedQualification?.code || 'CON/Q0601'}
            </span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Awarding Body: <strong>{formData.selectedQualification?.awarding_body || 'National Council for Vocational Education and Training'}</strong>
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            <span>Source: {formData.selectedQualification?.source_file || 'NQR_Qualifications_Summary.xlsx.xlsx'}</span>
            <span className="text-teal-700 font-semibold">{language === 'hi' ? 'कौशल घोषणा द्वारा सुमेलित' : 'Matched via Skills Declaration'}</span>
          </div>
        </div>
      </div>

      {/* Section 3: Declared Skills & Tasks */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
            <Briefcase className="w-4 h-4 text-teal-600" />
            {t('summarySkillsCard', { count: declaredSkills.length })}
          </h3>
          <button
            type="button"
            onClick={() => onEditSection(2)}
            className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-lg hover:border-teal-400 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> {t('edit')}
          </button>
        </div>

        {declaredSkills.length === 0 ? (
          <p className="text-slate-400 italic">{t('noSkillsDeclared')}</p>
        ) : (
          <div className="space-y-2">
            {declaredSkills.map((sk, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-900">{sk.title}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                    {sk.frequency}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">{sk.description}</p>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  <strong>{t('toolsUsedLabel')}:</strong> {sk.tools}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4: Attached Evidence Items */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
            <Camera className="w-4 h-4 text-teal-600" />
            {t('summaryEvidenceCard', { count: evidenceList.length })}
          </h3>
          <button
            type="button"
            onClick={() => onEditSection(3)}
            className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-lg hover:border-teal-400 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> {t('edit')}
          </button>
        </div>

        {evidenceList.length === 0 ? (
          <p className="text-slate-400 italic">{t('noEvidenceAttached')}</p>
        ) : (
          <div className="space-y-2">
            {evidenceList.map((ev, i) => (
              <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {ev.url ? (
                    <img src={ev.url} alt={ev.fileName || ev.title || 'Work evidence photo showing trade task'} className="w-10 h-10 object-cover rounded-lg border flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate text-[11px]">{ev.fileName || ev.title || 'Work Artifact'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{ev.type} • {ev.relatedSkill || 'Trade Task'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {ev.verificationStatus || (language === 'hi' ? 'समीक्षाधीन' : 'Pending Review')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Standards Grounding Disclaimer */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{t('criteriaLanguageDisclaimer')}</span>
      </div>

      {/* Pre-Submission Declaration Checkbox */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={finalConsent}
            onChange={(e) => setFinalConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
          />
          <div className="text-[11px] text-teal-950 leading-relaxed">
            <strong className="block font-bold mb-0.5 text-teal-900">
              {t('summaryDeclarationTitle')}:
            </strong>
            {t('summaryDeclarationText')}
          </div>
        </label>
        {submitError && (
          <p className="text-rose-600 text-xs mt-2 font-medium flex items-center gap-1 pl-6">
            <AlertCircle className="w-3.5 h-3.5" />
            {submitError}
          </p>
        )}
      </div>

      {/* Actions */}
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            icon={isSubmitting ? Sparkles : Send}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? (language === 'hi' ? "आवेदन जमा हो रहा है..." : "Submitting Application...") : t('submitApplicationBtn')}
          </Button>
        </div>
      </div>

    </div>
  );
};
