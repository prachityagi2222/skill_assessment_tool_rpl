import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { QUALIFICATIONS } from '../data/qualifications';
import { offlineDbService } from '../services/offlineDb';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [candidates, setCandidates] = useState(() => storage.getCandidates());
  const [assessors, setAssessors] = useState(() => storage.getAssessors());
  const [auditLogs, setAuditLogs] = useState(() => storage.getAuditLogs());
  const [activeRole, setActiveRoleState] = useState(() => storage.getActiveRole());
  const [activeCandidateId, setActiveCandidateIdState] = useState(() => storage.getActiveCandidateId());
  const [activeAssessorId, setActiveAssessorIdState] = useState(() => storage.getActiveAssessorId());
  const [viewMode, setViewModeState] = useState(() => storage.getViewMode());

  // Save changes to localStorage
  useEffect(() => {
    storage.saveCandidates(candidates);
  }, [candidates]);

  useEffect(() => {
    storage.saveAssessors(assessors);
  }, [assessors]);

  useEffect(() => {
    storage.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  const setActiveRole = (role) => {
    setActiveRoleState(role);
    storage.setActiveRole(role);
  };

  const setActiveCandidateId = (id) => {
    setActiveCandidateIdState(id);
    storage.setActiveCandidateId(id);
  };

  const setActiveAssessorId = (id) => {
    setActiveAssessorIdState(id);
    storage.setActiveAssessorId(id);
  };

  const setViewMode = (mode) => {
    setViewModeState(mode);
    storage.setViewMode(mode);
  };

  // Find active records
  const activeCandidate = candidates.find(c => c.id === activeCandidateId) || candidates[0];
  const activeAssessor = assessors.find(a => a.id === activeAssessorId) || assessors[0];

  // Helper to add audit log
  const logAudit = (action, actor, candidateId, candidateName, details, aiInvolvement) => {
    const newLog = {
      id: `AUDIT-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase() : Date.now().toString().slice(-4))}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      candidateId,
      candidateName,
      details,
      aiInvolvement: aiInvolvement || "Human-in-the-loop verification recorded.",
      hash: `0x${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 8) : Math.random().toString(16).substring(2, 10))}...sha256`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add work evidence to candidate
  const addEvidence = (candidateId, newEvidence) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      const updatedList = [newEvidence, ...(c.evidenceList || [])];
      return {
        ...c,
        evidenceList: updatedList,
        status: c.status === 'DRAFT' ? 'SUBMITTED' : c.status
      };
    }));

    const cand = candidates.find(c => c.id === candidateId);
    logAudit(
      "EVIDENCE_SUBMITTED",
      `${cand?.name || 'Worker'} (Self-reported)`,
      candidateId,
      cand?.name || 'Worker',
      `New work evidence added: "${newEvidence.title}" (${newEvidence.type}). Ready for AI categorization.`,
      "Evidence queued for automated NOS feature extraction and tool identification."
    );
  };

  // Run AI Pre-assessment analysis
  const runAiPreAssessment = (candidateId) => {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;

    const qual = QUALIFICATIONS.find(q => q.id === cand.qualificationId) || QUALIFICATIONS[0];
    
    // Calculate simulated dynamic score based on evidence count
    const evidenceCount = (cand.evidenceList || []).length;
    const baseScore = 75;
    const bonus = Math.min(evidenceCount * 5, 18);
    const calculatedReadiness = Math.min(baseScore + bonus, 94);

    const updatedCandidate = {
      ...cand,
      status: cand.status === 'DRAFT' ? 'SUBMITTED' : cand.status,
      aiSummary: {
        readinessScore: calculatedReadiness,
        predictedNsqfLevel: qual.nsqfLevel,
        qualificationMatch: `${qual.title} (${qual.code})`,
        nosReadiness: qual.nosList.map((nos, idx) => ({
          nosCode: nos.code,
          nosTitle: nos.title.substring(0, 24) + '...',
          readiness: Math.max(68, calculatedReadiness - (idx * 4)),
          status: (calculatedReadiness - (idx * 4)) >= 75 ? 'Ready' : 'Needs Viva Focus'
        })),
        humanAssessorRecommendation: `AI Pre-screen complete for ${qual.title}. High evidentiary support. Certified Assessor must independently examine practical tasks and sign off.`
      }
    };

    setCandidates(prev => prev.map(c => c.id === candidateId ? updatedCandidate : c));

    logAudit(
      "AI_PRE_ASSESSMENT_COMPLETED",
      "AI Skill Engine v2.4 (Automated)",
      candidateId,
      cand.name,
      `AI processed ${evidenceCount} evidence artifacts. Generated readiness score of ${calculatedReadiness}%.`,
      "Strict Human-in-the-Loop enforced: Automated score is non-binding and advisory for authorized Assessor."
    );
  };

  // Assessor submits practical evaluation
  const submitAssessorAssessment = (candidateId, assessmentData) => {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;

    const isCompetent = assessmentData.verdict === 'COMPETENT';
    const certId = isCompetent ? `RPL-2026-${cand.qualificationId.split('-')[1] || 'SKL'}-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase().replace(/-/g, '') : Math.floor(10000 + Math.random() * 90000))}` : null;

    const updatedAssessmentRecord = {
      evaluatedAt: new Date().toISOString(),
      assessorId: activeAssessor.id,
      assessorName: activeAssessor.name,
      checklistResults: assessmentData.checklistResults,
      rubricScores: assessmentData.rubricScores,
      finalWeightedScore: assessmentData.finalWeightedScore,
      verdict: assessmentData.verdict,
      assessorRemarks: assessmentData.assessorRemarks,
      digitalSignature: `${activeAssessor.name.toUpperCase().replace(/\s+/g, '_')}_NSDC_SIG_${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now())}`,
      certificateId: certId,
      certificateIssueDate: isCompetent ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null
    };

    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      return {
        ...c,
        status: isCompetent ? 'COMPETENT' : 'BRIDGE_REQUIRED',
        assessmentRecord: updatedAssessmentRecord
      };
    }));

    logAudit(
      isCompetent ? "ASSESSMENT_DECISION_COMPETENT" : "ASSESSMENT_DECISION_BRIDGE_MANDATED",
      `${activeAssessor.name} (${activeAssessor.badgeNumber})`,
      candidateId,
      cand.name,
      isCompetent 
        ? `Official Assessor signed off: CANDIDATE DECLARED COMPETENT (Score: ${assessmentData.finalWeightedScore}%). Certificate ${certId} issued.`
        : `Official Assessor determined Bridge Training is required (Score: ${assessmentData.finalWeightedScore}%). Gap areas noted.`,
      "Assessor physically verified practical skills using official NOS rubric. AI autonomy was 0%."
    );
  };

  // Coordinator allocates candidate to assessor
  const allocateAssessor = (candidateId, assessorId) => {
    const cand = candidates.find(c => c.id === candidateId);
    const assessor = assessors.find(a => a.id === assessorId);
    if (!cand || !assessor) return;

    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      return {
        ...c,
        assignedAssessorId: assessorId,
        status: c.status === 'SUBMITTED' ? 'IN_REVIEW' : c.status
      };
    }));

    logAudit(
      "ASSESSOR_ALLOCATED",
      "Scheme Operations Coordinator",
      candidateId,
      cand.name,
      `Allocated to ${assessor.name} (${assessor.centerName}). Target Trade: ${cand.currentRoleName}.`,
      "Administrative workflow step."
    );
  };

  // Coordinator authorizes assessment record submitted for authorized review
  const authorizeAssessmentRecord = (candidateId, notes = '') => {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand || !cand.assessmentRecord) return;

    const isCompetent = cand.assessmentRecord.verdict === 'COMPETENT';
    const certId = cand.assessmentRecord.certificateId || (isCompetent ? `RPL-2026-${(cand.qualificationId || 'SKL').split('-')[1] || 'SKL'}-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase().replace(/-/g, '') : Math.floor(10000 + Math.random() * 90000))}` : null);

    const updatedRecord = {
      ...cand.assessmentRecord,
      status: 'AUTHORISED',
      authorisedAt: new Date().toISOString(),
      authorisedBy: ((import.meta?.env?.DEV ?? true) ? 'Dr. Priya Nair (Scheme Coordinator)' : 'Scheme Coordinator'),
      coordinatorRemarks: notes || 'Assessment audited and officially authorized by Scheme Coordinator. Certified according to NSQF RPL standards.',
      certificateId: certId,
      certificateIssueDate: isCompetent ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null
    };

    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      return {
        ...c,
        status: isCompetent ? 'COMPETENT' : 'BRIDGE_REQUIRED',
        assessmentRecord: updatedRecord,
        evidenceReviewStatus: 'Assessor & Coordinator Verified'
      };
    }));

    logAudit(
      "COORDINATOR_AUTHORISED_REVIEW",
      "Dr. Priya Nair (Scheme Coordinator)",
      candidateId,
      cand.name,
      `Coordinator validated practical evaluation and officially authorized RPL outcome: ${isCompetent ? 'COMPETENT' : 'BRIDGE_REQUIRED'}. ${certId ? `Certificate ${certId} validated and issued.` : ''}`,
      "Authorised Human Sign-Off complete. Dual assessor-coordinator governance enforced."
    );
  };

  // Register a new blank candidate for onboarding
  const registerNewCandidate = (candidateData = {}) => {
    const newCount = candidates.length + 1;
    const newId = `CAND-2026-${String(newCount).padStart(3, '0')}`;
    const newCand = {
      id: newId,
      name: candidateData.name || '',
      currentRoleName: candidateData.currentRoleName || candidateData.trade || '',
      yearsExperience: candidateData.yearsExperience || 1,
      phone: candidateData.phone || '',
      location: candidateData.location || '',
      language: candidateData.language || 'hi',
      qualificationId: null,
      nsqfLevel: null,
      status: 'DRAFT',
      assignedAssessorId: null,
      evidenceList: [],
      aadhaarMasked: 'XXXX-XXXX-' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/\D/g, '').slice(0, 4).padEnd(4, '0') : Math.floor(1000 + Math.random() * 9000)),
      isDemoRecord: true,
      hasConsent: false,
      ...candidateData
    };

    setCandidates(prev => [newCand, ...prev]);
    setActiveCandidateId(newId);
    setActiveRole('worker');

    try {
      localStorage.removeItem('kaushalsetu_worker_application_draft_v1');
    } catch {}

    logAudit(
      "WORKER_REGISTRATION_INITIATED",
      "Candidate Portal (Self-Service)",
      newId,
      newCand.name || 'New Candidate',
      `New worker profile registration session opened (ID: ${newId}).`,
      "Candidate initiating self-declared experiential profile."
    );

    return newCand;
  };

  // Update candidate profile fields
  const updateCandidate = (candidateId, updates) => {
    setCandidates(prev => {
      const exists = prev.some(c => c.id === candidateId);
      if (exists) {
        return prev.map(c => (c.id === candidateId ? { ...c, ...updates } : c));
      }
      return [{ id: candidateId, ...updates }, ...prev];
    });
  };

  // Record Assessor Qualification Pack determination & professional rationale
  const recordAssessorQualificationDecision = (candidateId, decision) => {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;

    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      return {
        ...c,
        confirmedQualification: decision.qualification,
        assessorQualificationDecision: {
          ...decision,
          assessorId: activeAssessor.id,
          assessorName: activeAssessor.name,
          recordedAt: new Date().toISOString()
        }
      };
    }));

    logAudit(
      "ASSESSOR_QUALIFICATION_DETERMINATION",
      `${activeAssessor.name} (${activeAssessor.badgeNumber})`,
      candidateId,
      cand.name,
      `Assessor action: ${decision.actionType}. Qualification: "${decision.qualification?.title || 'None'}" (${decision.qualification?.code || 'N/A'}). Rationale: "${decision.rationale}".`,
      "Strict Human-in-the-Loop decision: Assessor finalized qualification pack for practical evaluation."
    );
  };

  // Reset demo data
  const resetDemoData = () => {
    storage.resetAllData();
    offlineDbService.clearAllOfflineData(true);
    setCandidates(storage.getCandidates());
    setAssessors(storage.getAssessors());
    setAuditLogs(storage.getAuditLogs());
    setActiveCandidateId('CAND-2026-001');
    setActiveAssessorId('ASSESSOR-101');
  };

  return (
    <AppContext.Provider
      value={{
        candidates,
        assessors,
        auditLogs,
        activeRole,
        setActiveRole,
        activeCandidateId,
        setActiveCandidateId,
        activeCandidate,
        activeAssessorId,
        setActiveAssessorId,
        activeAssessor,
        viewMode,
        setViewMode,
        registerNewCandidate,
        updateCandidate,
        recordAssessorQualificationDecision,
        addEvidence,
        runAiPreAssessment,
        submitAssessorAssessment,
        allocateAssessor,
        authorizeAssessmentRecord,
        resetDemoData,
        qualifications: QUALIFICATIONS
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
