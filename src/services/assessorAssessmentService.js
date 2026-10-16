// Assessor Assessment Service
// Handles competency criteria retrieval from extracted sources,
// provisional vs source rubrics, evidence linking, persistence, and audit revisions.

import { dataRepository } from './dataRepository.js';
import { offlineDbService } from './offlineDb.js';
import { syncService } from './syncService.js';

const ASSESSOR_EVALUATIONS_STORAGE_KEY = 'kaushalsetu_assessor_evaluations_v2';

// 4-level provisional rubric mandated when no source scoring rubric exists
export const PROVISIONAL_RUBRIC = {
  NOT_ASSESSED: {
    key: 'NOT_ASSESSED',
    label: 'Not Assessed',
    description: 'Criterion has not been evaluated yet',
    color: 'slate'
  },
  NOT_DEMONSTRATED: {
    key: 'NOT_DEMONSTRATED',
    label: 'Not Demonstrated',
    description: 'Candidate did not demonstrate practical competence',
    color: 'rose'
  },
  PARTIALLY_DEMONSTRATED: {
    key: 'PARTIALLY_DEMONSTRATED',
    label: 'Partially Demonstrated',
    description: 'Candidate demonstrated partial competence with gaps',
    color: 'amber'
  },
  DEMONSTRATED: {
    key: 'DEMONSTRATED',
    label: 'Demonstrated',
    description: 'Candidate consistently demonstrated the required performance criterion',
    color: 'emerald'
  }
};

export const EVIDENCE_STATUSES = {
  PENDING: {
    key: 'PENDING',
    label: 'Pending Review',
    color: 'slate'
  },
  REVIEWED: {
    key: 'REVIEWED',
    label: 'Reviewed',
    color: 'emerald'
  },
  INSUFFICIENT: {
    key: 'INSUFFICIENT',
    label: 'Insufficient Evidence',
    color: 'amber'
  },
  REQUIRES_VERIFICATION: {
    key: 'REQUIRES_VERIFICATION',
    label: 'Requires Verification',
    color: 'purple'
  }
};

class AssessorAssessmentService {
  constructor() {
    this.evaluations = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(ASSESSOR_EVALUATIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveToStorage(candidateId = null) {
    try {
      // Cap revisionHistory to last 50 entries per evaluation to bound localStorage growth.
      for (const cid of Object.keys(this.evaluations)) {
        const rec = this.evaluations[cid];
        if (rec && Array.isArray(rec.revisionHistory) && rec.revisionHistory.length > 50) {
          rec.revisionHistory = rec.revisionHistory.slice(0, 50);
        }
      }
      localStorage.setItem(ASSESSOR_EVALUATIONS_STORAGE_KEY, JSON.stringify(this.evaluations));
    } catch (e) {
      console.error('Failed to save assessor evaluations to localStorage', e);
    }

    // Structured IndexedDB (Dexie) persistence & sync queueing
    try {
      if (candidateId && this.evaluations[candidateId]) {
        offlineDbService.saveAssessorDraft(candidateId, this.evaluations[candidateId]);
        syncService.enqueueOperation({
          entityType: 'ASSESSOR_DRAFT',
          entityId: candidateId,
          action: 'UPSERT',
          payload: this.evaluations[candidateId]
        }).catch(() => {});
      } else {
        Object.keys(this.evaluations).forEach(cid => {
          offlineDbService.saveAssessorDraft(cid, this.evaluations[cid]);
        });
      }
    } catch (err) {
      console.warn('[AssessorService] IndexedDB sync error:', err);
    }
  }

  // Get or initialize evaluation dossier for a candidate
  async getEvaluation(candidateId, candidate) {
    await dataRepository.init();

    if (!this.evaluations[candidateId]) {
      // Attempt to load from IndexedDB if available
      try {
        const indexedDraft = await offlineDbService.getAssessorDraft(candidateId);
        if (indexedDraft) {
          this.evaluations[candidateId] = indexedDraft;
          return indexedDraft;
        }
      } catch {}

      const initialQualId = candidate?.confirmedQualification?.id || candidate?.qualificationId || ((import.meta?.env?.DEV ?? true) ? 'NQR-2022/OAFM/MEPSC/06022' : null);
      const qualRecord = await dataRepository.getQualificationById(initialQualId) || {
        id: initialQualId,
        title: candidate?.currentRoleName || 'General Vocational Assessment',
        code: candidate?.targetQualificationCode || 'UNSPECIFIED',
        sector: 'Vocational Training'
      };

      const criteria = await this.getApplicableCriteria(qualRecord.code, qualRecord.id);

      this.evaluations[candidateId] = {
        candidateId,
        qualification: qualRecord,
        curriculumVersion: null, // e.g. 'CURR-ES-30H' if ES selected
        status: candidate?.status === 'COMPETENT' ? 'completed' : (candidate?.status === 'IN_REVIEW' ? 'in_progress' : 'assigned'),
        criteriaAssessments: {},
        evidenceReviews: {},
        assessorNotes: '',
        recommendation: '',
        recommendationRationale: '',
        isOfficial: criteria.isSourceVerified,
        sourceVerificationWarning: criteria.isSourceVerified ? null : 'Source verification required: Official performance criteria annexure not in supplied files.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        revisionHistory: [
          {
            timestamp: new Date().toISOString(),
            actor: 'System',
            action: 'INITIALIZED',
            summary: `Evaluation dossier created for candidate ${candidate?.name || candidateId}.`
          }
        ]
      };

      // Populate evidence reviews if candidate has evidence
      if (candidate?.evidenceList) {
        candidate.evidenceList.forEach(ev => {
          this.evaluations[candidateId].evidenceReviews[ev.id] = {
            status: 'PENDING',
            reason: '',
            reviewedAt: null
          };
        });
      }

      this.saveToStorage();
    }

    return this.evaluations[candidateId];
  }

  // Retrieve applicable criteria based on confirmed qualification
  async getApplicableCriteria(qualificationCode, qualId, curriculumId = null) {
    await dataRepository.init();

    // Check if real performance criteria exist in extracted data
    const sourcePcs = dataRepository.getPerformanceCriteria(qualificationCode);
    const assessmentMethods = dataRepository.getAssessmentMethods(qualificationCode);
    const rubric = dataRepository.getAssessmentRubrics(qualificationCode)?.[0] || null;
    const evidenceReqs = dataRepository.getEvidenceRequirements(qualificationCode);

    if (sourcePcs && sourcePcs.length > 0) {
      // Direct source criteria verified!
      return {
        qualificationCode,
        isSourceVerified: true,
        sourceType: 'EXTRACTED_DETAILED_ANNEXURE',
        sourceFile: sourcePcs[0]?.source?.source_file || 'Assessment_Guide.pdf.pdf',
        sourceReference: `Pages 16-26, ${sourcePcs.length} Performance Criteria`,
        hasOfficialRubric: Boolean(rubric),
        officialRubric: rubric,
        assessmentMethods,
        evidenceRequirements: evidenceReqs,
        criteria: sourcePcs.map(pc => ({
          id: pc.id,
          code: pc.pc_code,
          description: pc.description,
          associatedModule: pc.nos_code || (rubric?.module_weightages?.find(m => pc.id.includes(m.nos_code))?.title) || 'Domain Practical Standard',
          sourceFile: pc.source?.source_file || 'Assessment_Guide.pdf.pdf',
          sourcePage: pc.source?.page || 16,
          sourceType: pc.source?.source_type || 'Detailed Assessment Criteria Annexure',
          assessmentMethod: assessmentMethods.find(m => m.applicable_qualification === qualificationCode)?.method_name || 'Practical Demonstration & Applications',
          weightage: rubric?.module_weightages?.[0]?.weightage || null,
          isProvisional: false
        }))
      };
    }

    // If candidate also requests Employability Skills curriculum criteria
    if (curriculumId) {
      const compList = dataRepository.getCompetencies({ curriculum_id: curriculumId });
      if (compList && compList.length > 0) {
        const curr = dataRepository.getCurriculumById(curriculumId);
        return {
          qualificationCode,
          isSourceVerified: true,
          sourceType: 'EMPLOYABILITY_SKILLS_CURRICULUM',
          sourceFile: curr?.source_file || 'Employability_Skills.pdf',
          sourceReference: `${curr?.duration_hours} Hours Curriculum (${compList.length} Competencies)`,
          hasOfficialRubric: false,
          officialRubric: null,
          assessmentMethods: [],
          evidenceRequirements: [],
          criteria: compList.map(c => ({
            id: c.id,
            code: `Outcome ${c.outcome_number}`,
            description: c.description,
            associatedModule: `ES Module ${c.duration_hours}h`,
            sourceFile: c.source?.source_file || 'Employability_Skills.pdf',
            sourcePage: c.source?.page || 1,
            sourceType: c.source?.source_type || 'Model Curriculum PDF',
            assessmentMethod: 'Formative Assessment / Portfolio Review',
            isProvisional: false
          }))
        };
      }
    }

    // Granular source criteria not in supplied documents -> Fall back to standard NOS with Source Verification Required warning
    const qual = await dataRepository.getQualificationById(qualId) || dataRepository.getQualificationByCode(qualificationCode);
    const nosList = qual?.nosList || [
      { code: `${qualificationCode || 'NOS'}/N01`, title: 'Core Occupational Practices and Tool Operations' },
      { code: `${qualificationCode || 'NOS'}/N02`, title: 'Safety, Health and Environmental Protocols at Workplace' },
      { code: `${qualificationCode || 'NOS'}/N03`, title: 'Quality Inspection, Diagnostic Testing and Troubleshooting' },
      { code: `${qualificationCode || 'NOS'}/N04`, title: 'Professional Work Ethics and Client Communication' }
    ];

    return {
      qualificationCode: qualificationCode || qual?.code || 'UNVERIFIED',
      isSourceVerified: false,
      sourceVerificationMessage: 'Source verification required: Detailed performance criteria annexure not found in supplied files. Provisional rubric applied.',
      sourceType: 'NQR_CATALOG_SUMMARY',
      sourceFile: qual?.source_file || 'NQR Qualifications Excel',
      sourceReference: qual?.source_row ? `Excel Row(s) ${Array.isArray(qual.source_row) ? qual.source_row.join(', ') : qual.source_row}` : 'NQR Master Record',
      hasOfficialRubric: false,
      officialRubric: null,
      assessmentMethods: [],
      evidenceRequirements: [],
      criteria: nosList.map((nos, index) => ({
        id: `PROV-CRIT-${qualificationCode || 'QUAL'}-${nos.code || index + 1}`,
        code: nos.code || `CRIT-${index + 1}`,
        description: nos.title || 'Standard Occupational Unit',
        associatedModule: nos.code || 'National Occupational Standard',
        sourceFile: qual?.source_file || 'NQR Qualifications Excel',
        sourcePage: null,
        sourceRow: qual?.source_row || 'NQR Entry',
        sourceType: 'NQR Catalogue Summary',
        assessmentMethod: 'Provisional Assessor Review (Requires Authorized Review)',
        isProvisional: true
      }))
    };
  }

  // Update criterion evaluation
  updateCriterionEvaluation(candidateId, criterionId, {
    outcome,
    observations = '',
    linkedEvidenceIds = [],
    insufficientFlag = false,
    insufficientReason = '',
    assessorInfo = {}
  }) {
    if (!this.evaluations[candidateId]) return null;

    const evalRecord = this.evaluations[candidateId];
    const prevCriterion = evalRecord.criteriaAssessments[criterionId] || {};

    const updatedCriterion = {
      ...prevCriterion,
      criterionId,
      outcome: outcome || prevCriterion.outcome || 'NOT_ASSESSED',
      observations: observations !== undefined ? observations : (prevCriterion.observations || ''),
      linkedEvidenceIds: linkedEvidenceIds || prevCriterion.linkedEvidenceIds || [],
      insufficientFlag: Boolean(insufficientFlag),
      insufficientReason: insufficientFlag ? (insufficientReason || prevCriterion.insufficientReason || '') : '',
      updatedAt: new Date().toISOString(),
      assessedBy: assessorInfo.name || 'Authorised Assessor'
    };

    evalRecord.criteriaAssessments[criterionId] = updatedCriterion;
    evalRecord.updatedAt = new Date().toISOString();

    // Preserve revision history without overwriting
    evalRecord.revisionHistory.unshift({
      timestamp: new Date().toISOString(),
      actor: assessorInfo.name || 'Authorised Assessor',
      action: 'CRITERION_EVALUATED',
      summary: `Criterion ${criterionId} set to "${outcome || updatedCriterion.outcome}". Linked ${updatedCriterion.linkedEvidenceIds.length} evidence items.`
    });
    evalRecord.revisionHistory = evalRecord.revisionHistory.slice(0, 50);

    if (evalRecord.status === 'assigned') {
      evalRecord.status = 'in_progress';
    }

    this.saveToStorage();
    return updatedCriterion;
  }

  // Update evidence review status
  updateEvidenceReview(candidateId, evidenceId, status, reason = '', assessorInfo = {}) {
    if (!this.evaluations[candidateId]) return null;

    const evalRecord = this.evaluations[candidateId];
    if (!evalRecord.evidenceReviews) {
      evalRecord.evidenceReviews = {};
    }

    evalRecord.evidenceReviews[evidenceId] = {
      status, // 'REVIEWED' | 'INSUFFICIENT' | 'REQUIRES_VERIFICATION'
      reason: reason || '',
      reviewedAt: new Date().toISOString(),
      reviewedBy: assessorInfo.name || 'Authorised Assessor'
    };

    evalRecord.updatedAt = new Date().toISOString();

    evalRecord.revisionHistory.unshift({
      timestamp: new Date().toISOString(),
      actor: assessorInfo.name || 'Authorised Assessor',
      action: 'EVIDENCE_REVIEWED',
      summary: `Evidence "${evidenceId}" marked as "${status}". Reason: "${reason || 'None provided'}"`
    });
    evalRecord.revisionHistory = evalRecord.revisionHistory.slice(0, 50);

    this.saveToStorage();
    return evalRecord.evidenceReviews[evidenceId];
  }

  // Update confirmed qualification
  async setConfirmedQualification(candidateId, qualification, rationale, assessorInfo = {}) {
    const evalRecord = await this.getEvaluation(candidateId);
    const prevTitle = evalRecord.qualification?.title || 'None';

    evalRecord.qualification = qualification;
    evalRecord.updatedAt = new Date().toISOString();

    // Check criteria for new qualification
    const criteriaInfo = await this.getApplicableCriteria(qualification.code, qualification.id);
    evalRecord.isOfficial = criteriaInfo.isSourceVerified;
    evalRecord.sourceVerificationWarning = criteriaInfo.isSourceVerified ? null : 'Source verification required';

    evalRecord.revisionHistory.unshift({
      timestamp: new Date().toISOString(),
      actor: assessorInfo.name || 'Authorised Assessor',
      action: 'QUALIFICATION_CONFIRMED',
      summary: `Qualification changed from "${prevTitle}" to "${qualification.title}" (${qualification.code}). Rationale: "${rationale}"`
    });
    evalRecord.revisionHistory = evalRecord.revisionHistory.slice(0, 50);

    this.saveToStorage();
    return evalRecord;
  }

  // Save draft assessment summary
  saveDraftSummary(candidateId, { notes, recommendation, rationale }, assessorInfo = {}) {
    if (!this.evaluations[candidateId]) return null;

    const evalRecord = this.evaluations[candidateId];
    evalRecord.assessorNotes = notes || evalRecord.assessorNotes;
    evalRecord.recommendation = recommendation || evalRecord.recommendation;
    evalRecord.recommendationRationale = rationale || evalRecord.recommendationRationale;
    evalRecord.updatedAt = new Date().toISOString();

    evalRecord.revisionHistory.unshift({
      timestamp: new Date().toISOString(),
      actor: assessorInfo.name || 'Authorised Assessor',
      action: 'DRAFT_SAVED',
      summary: 'Assessor draft summary and rationale saved.'
    });
    evalRecord.revisionHistory = evalRecord.revisionHistory.slice(0, 50);

    this.saveToStorage();
    return evalRecord;
  }

  // Submit for Authorised Review
  submitForAuthorisedReview(candidateId, { notes, recommendation, rationale }, assessorInfo = {}) {
    if (!this.evaluations[candidateId]) return null;

    const evalRecord = this.evaluations[candidateId];
    evalRecord.assessorNotes = notes || evalRecord.assessorNotes;
    evalRecord.recommendation = recommendation || evalRecord.recommendation;
    evalRecord.recommendationRationale = rationale || evalRecord.recommendationRationale;
    evalRecord.status = 'submitted_review';
    evalRecord.submittedAt = new Date().toISOString();
    evalRecord.updatedAt = new Date().toISOString();

    evalRecord.revisionHistory.unshift({
      timestamp: new Date().toISOString(),
      actor: assessorInfo.name || 'Authorised Assessor',
      action: 'SUBMITTED_FOR_REVIEW',
      summary: `Assessment submitted for Authorised Review with recommendation "${recommendation}".`
    });
    evalRecord.revisionHistory = evalRecord.revisionHistory.slice(0, 50);

    this.saveToStorage();
    return evalRecord;
  }

  // Calculate progress ratio (proportion of criteria reviewed)
  calculateProgress(criteriaAssessments = {}, totalCriteriaCount = 0) {
    if (totalCriteriaCount === 0) return { reviewedCount: 0, totalCount: 0, percentage: 0 };

    const reviewedCount = Object.values(criteriaAssessments).filter(
      c => c && c.outcome && c.outcome !== 'NOT_ASSESSED'
    ).length;

    const percentage = Math.round((reviewedCount / totalCriteriaCount) * 100);

    return {
      reviewedCount,
      totalCount: totalCriteriaCount,
      percentage
    };
  }

  // Clear or reset evaluations
  resetEvaluations() {
    this.evaluations = {};
    try {
      localStorage.removeItem(ASSESSOR_EVALUATIONS_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  }
}

export const assessorAssessmentService = new AssessorAssessmentService();
