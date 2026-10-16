import React from 'react';
import { Award, User, UserPlus, ShieldCheck, LayoutDashboard, Sparkles, CheckCircle2, ChevronRight, Mic, Camera, FileCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { HumanInTheLoopBanner } from '../components/common/HumanInTheLoopBanner';
import { Button } from '../components/common/Button';

export const WelcomePage = () => {
  const { setActiveRole, setActiveCandidateId, setActiveAssessorId, candidates, assessors, registerNewCandidate } = useApp();
  const { t, language } = useLanguage();

  const handleRegisterNewWorker = () => {
    registerNewCandidate();
  };

  const handleSelectWorker = (candId) => {
    setActiveCandidateId(candId);
    setActiveRole('worker');
  };

  const handleSelectAssessor = (assessorId) => {
    setActiveAssessorId(assessorId);
    setActiveRole('assessor');
  };

  const handleSelectCoordinator = () => {
    setActiveRole('coordinator');
  };

  return (
    <div className="space-y-5 py-2">
      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-md">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                  SIH 2026 • PS 26242
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Recognition of Prior Learning (RPL)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {t('appTitle')}
              </h1>
            </div>
          </div>

          {/* Language Selector in Header */}
          <div className="self-start sm:self-auto">
            <LanguageSelector />
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl">
          {t('appSubtitle')}. Helping informal craftspeople & experienced workers benchmark their experiential skills against official <strong>National Occupational Standards (NOS)</strong> and <strong>NSQF Levels</strong>.
        </p>

        {/* Core Pillars Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-xl">
            <Mic className="w-4 h-4 text-teal-600" />
            <span>Voice Work Logs</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-xl">
            <Camera className="w-4 h-4 text-teal-600" />
            <span>Photo / Video Evidence</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-xl">
            <FileCheck className="w-4 h-4 text-teal-600" />
            <span>NOS Rubric Checklists</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Human-Certified Only</span>
          </div>
        </div>
      </div>

      {/* Human In The Loop Mandate Banner */}
      <HumanInTheLoopBanner />

      {/* Role Selection Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t('selectRole')}
            </h2>
            <p className="text-xs text-slate-500">
              Select any role below to explore the working prototype with demo credentials
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Card 1: Worker / Candidate */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-md transition-all p-5 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  Role 1
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                {t('workerRole')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t('workerRoleDesc')}
              </p>
              
              {/* Quick candidate switcher chips */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                  {language === 'hi' ? 'कारीगर विकल्प चुनें:' : 'Select Candidate Option:'}
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={handleRegisterNewWorker}
                    className="w-full text-left p-2.5 rounded-xl bg-teal-50/90 hover:bg-teal-100 border-2 border-teal-400 text-xs transition-colors flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                        <UserPlus className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-teal-950 text-xs">{language === 'hi' ? '+ नया कारीगर पंजीकरण' : '+ Register New Worker'}</p>
                        <p className="text-[10px] text-teal-700">{language === 'hi' ? 'खाली फॉर्म भरें और नया आवेदन करें' : 'Start with a fresh blank application'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-300">
                      {language === 'hi' ? 'नया' : 'New'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleSelectWorker('CAND-2026-001')}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-xs transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">Ramesh Kumar</p>
                      <p className="text-[11px] text-slate-500">Domestic Electrician (6 yrs exp)</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Demo Certified
                    </span>
                  </button>
                  <button
                    onClick={() => handleSelectWorker('CAND-2026-002')}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-xs transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">Sunita Devi</p>
                      <p className="text-[11px] text-slate-500">Healthcare GDA (4 yrs exp)</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      In Review
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                fullWidth
                onClick={handleRegisterNewWorker}
                icon={UserPlus}
              >
                {language === 'hi' ? 'नया कारीगर पंजीकरण करें' : 'Register as New Worker'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => handleSelectWorker('CAND-2026-001')}
                icon={ArrowRight}
              >
                {language === 'hi' ? 'डेमो प्रोफ़ाइल देखें (रमेश कुमार)' : 'Explore Demo Profile (Ramesh Kumar)'}
              </Button>
            </div>
          </div>

          {/* Card 2: Assessor */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-sky-500 hover:shadow-md transition-all p-5 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                  Role 2
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                {t('assessorRole')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t('assessorRoleDesc')}
              </p>

              {/* Assessor Persona profile */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-4 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-sky-900 font-bold text-xs">
                    VS
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Er. Vikram Sharma</p>
                    <p className="text-[11px] text-slate-500">Badge: NSDC-ASSESS-8841</p>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-600 flex justify-between">
                  <span>Govt ITI Alambagh</span>
                  <span className="font-semibold text-sky-700">142 Assessed</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleSelectAssessor('ASSESSOR-101')}
              icon={ArrowRight}
            >
              Enter as Assessor
            </Button>
          </div>

          {/* Card 3: Coordinator / Admin */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all p-5 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  Role 3
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                {t('coordinatorRole')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t('coordinatorRoleDesc')}
              </p>

              {/* Coordinator Metrics */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-4 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px]">Active Candidates</span>
                  <span className="font-bold text-slate-900">{candidates.length} Registered</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px]">Certified Assessors</span>
                  <span className="font-bold text-slate-900">{assessors.length} On Duty</span>
                </div>
                <div className="flex justify-between items-center text-teal-700 font-semibold pt-1 border-t border-slate-200">
                  <span className="text-[11px]">Human Validation</span>
                  <span className="text-[11px] bg-teal-100 px-1.5 py-0.2 rounded">100% Compliant</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={handleSelectCoordinator}
              icon={ArrowRight}
            >
              Enter as Coordinator
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
