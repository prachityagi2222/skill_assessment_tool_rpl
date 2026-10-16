// Data Repository Service: Access layer for source-grounded qualifications & curriculum
// Backed by extracted data with local storage overlay for coordinator reviews & corrections.

const CORRECTIONS_STORAGE_KEY = 'kaushalsetu_data_corrections_v1';
const REVIEW_ISSUES_STORAGE_KEY = 'kaushalsetu_review_issues_v1';

class DataRepository {
  constructor() {
    this.qualificationsIndex = null;
    this.fullQualificationsMap = new Map();
    this.sources = null;
    this.curriculumVersions = null;
    this.modules = null;
    this.competencies = null;
    this.performanceCriteria = null;
    this.assessmentMethods = null;
    this.assessmentRubrics = null;
    this.evidenceRequirements = null;
    this.extractionReviewIssues = null;
    this.corrections = this.loadCorrections();
    this.isLoaded = false;
  }

  async fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load ${url}: HTTP ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  baseUrl() {
    // Vite build: './' (subpath-safe); Vite dev: '/'; plain Node tests: '/' fallback.
    return (import.meta?.env?.BASE_URL ?? '/');
  }

  loadCorrections() {
    try {
      const data = localStorage.getItem(CORRECTIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveCorrections() {
    try {
      localStorage.setItem(CORRECTIONS_STORAGE_KEY, JSON.stringify(this.corrections));
    } catch (e) {
      console.error('Failed to persist corrections', e);
    }
  }

  loadReviewIssues() {
    try {
      const data = localStorage.getItem(REVIEW_ISSUES_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveReviewIssues() {
    try {
      localStorage.setItem(REVIEW_ISSUES_STORAGE_KEY, JSON.stringify(this.extractionReviewIssues));
    } catch (e) {
      console.error('Failed to persist review issues', e);
    }
  }

  async init() {
    if (this.isLoaded) return;

    try {
      // Fetch collections from /data/ or relative public assets
      const [
        indexRes,
        sourcesRes,
        currRes,
        modulesRes,
        compRes,
        pcRes,
        amRes,
        arRes,
        erRes,
        issuesRes
      ] = await Promise.all([
        this.fetchJson(`${this.baseUrl()}data/qualifications_index.json`),
        this.fetchJson(`${this.baseUrl()}data/qualification_sources.json`),
        this.fetchJson(`${this.baseUrl()}data/curriculum_versions.json`),
        this.fetchJson(`${this.baseUrl()}data/modules.json`),
        this.fetchJson(`${this.baseUrl()}data/competencies.json`),
        this.fetchJson(`${this.baseUrl()}data/performance_criteria.json`),
        this.fetchJson(`${this.baseUrl()}data/assessment_methods.json`),
        this.fetchJson(`${this.baseUrl()}data/assessment_rubrics.json`),
        this.fetchJson(`${this.baseUrl()}data/evidence_requirements.json`),
        this.fetchJson(`${this.baseUrl()}data/extraction_review_issues.json`)
      ]);

      this.qualificationsIndex = indexRes;
      this.sources = sourcesRes;
      this.curriculumVersions = currRes;
      this.modules = modulesRes;
      this.competencies = compRes;
      this.performanceCriteria = pcRes;
      this.assessmentMethods = amRes;
      this.assessmentRubrics = arRes;
      this.evidenceRequirements = erRes;

      const savedIssues = this.loadReviewIssues();
      this.extractionReviewIssues = savedIssues || issuesRes;

      this.isLoaded = true;
    } catch (err) {
      console.error('Error loading extracted data repository (see failed data/*.json URL above):', err);
    }
  }

  // 1. Qualifications
  getQualifications(filter = {}) {
    if (!this.qualificationsIndex) return [];
    let list = [...this.qualificationsIndex];

    const activeIssuesCodes = new Set(
      (this.extractionReviewIssues || [])
        .filter(i => i.status !== 'resolved')
        .map(i => i.item_code)
        .filter(Boolean)
    );

    // Apply corrections overlay and normalize status to: extracted | reviewed | verified | requires_review
    list = list.map(q => {
      const correction = this.corrections[q.id];
      let baseStatus = q.verification_status;
      if (!baseStatus || baseStatus === 'unverified') {
        baseStatus = 'extracted';
      }
      if (activeIssuesCodes.has(q.code) && (!correction || !correction.verification_status)) {
        baseStatus = 'requires_review';
      }

      if (correction) {
        return {
          ...q,
          ...correction.correctedFields,
          verification_status: correction.verification_status || baseStatus,
          is_corrected: true,
          original_values: correction.original_values,
          correction_notes: correction.notes,
          corrected_at: correction.corrected_at
        };
      }
      return {
        ...q,
        verification_status: baseStatus
      };
    });

    if (filter.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(q =>
        (q.title && q.title.toLowerCase().includes(term)) ||
        (q.code && q.code.toLowerCase().includes(term)) ||
        (q.sector && q.sector.toLowerCase().includes(term))
      );
    }

    if (filter.sector && filter.sector !== 'ALL') {
      list = list.filter(q => q.sector === filter.sector);
    }

    if (filter.level !== undefined && filter.level !== null && filter.level !== '' && filter.level !== 'ALL') {
      list = list.filter(q => String(q.level) === String(filter.level));
    }

    if (filter.verification_status && filter.verification_status !== 'ALL') {
      list = list.filter(q => q.verification_status === filter.verification_status);
    }

    if (filter.source_file && filter.source_file !== 'ALL') {
      list = list.filter(q => q.source_file === filter.source_file);
    }

    return list;
  }

  getVerificationStats() {
    const list = this.getQualifications();
    const stats = {
      total: list.length,
      extracted: 0,
      reviewed: 0,
      verified: 0,
      requires_review: 0
    };
    list.forEach(q => {
      const st = q.verification_status || 'extracted';
      if (stats[st] !== undefined) {
        stats[st]++;
      } else {
        stats.extracted++;
      }
    });
    return stats;
  }

  async getQualificationById(id) {
    await this.init();
    // Try to find in index first
    const basic = this.qualificationsIndex?.find(q => q.id === id);
    if (!basic) return null;

    // Check full cache or fetch full qualifications.json if needed
    if (!this.fullQualificationsMap.has(id)) {
      try {
        const fullRes = await this.fetchJson(`${this.baseUrl()}data/qualifications.json`);
        fullRes.forEach(item => this.fullQualificationsMap.set(item.id, item));
      } catch (e) {
        console.warn('Could not load full qualifications catalogue (data/qualifications.json), using index record', e);
      }
    }

    const fullRecord = this.fullQualificationsMap.get(id) || basic;
    const correction = this.corrections[id];
    if (correction) {
      return {
        ...fullRecord,
        ...correction.correctedFields,
        verification_status: correction.verification_status || fullRecord.verification_status,
        is_corrected: true,
        original_values: correction.original_values
      };
    }
    return fullRecord;
  }

  getQualificationByCode(code) {
    if (!this.qualificationsIndex || !code) return null;
    return this.qualificationsIndex.find(q => q.code && q.code.trim() === code.trim());
  }

  // 2. Sources Manifest
  getQualificationSources() {
    return this.sources || [];
  }

  // 3. Curriculum Versions
  getCurriculumVersions() {
    return this.curriculumVersions || [];
  }

  getCurriculumById(id) {
    return this.curriculumVersions?.find(c => c.id === id) || null;
  }

  // 4. Modules
  getModules(filter = {}) {
    if (!this.modules) return [];
    let list = [...this.modules];

    if (filter.curriculum_id) {
      list = list.filter(m => m.curriculum_id === filter.curriculum_id);
    }
    if (filter.qualification_code) {
      list = list.filter(m => m.qualification_code === filter.qualification_code);
    }
    return list;
  }

  // 5. Competencies
  getCompetencies(filter = {}) {
    if (!this.competencies) return [];
    let list = [...this.competencies];

    if (filter.curriculum_id) {
      list = list.filter(c => c.curriculum_id === filter.curriculum_id);
    }
    if (filter.duration_hours) {
      list = list.filter(c => c.duration_hours === Number(filter.duration_hours));
    }
    return list;
  }

  // 6. Performance Criteria
  getPerformanceCriteria(qualificationCode) {
    if (!this.performanceCriteria) return [];
    if (!qualificationCode) return this.performanceCriteria;
    return this.performanceCriteria.filter(pc => pc.qualification_code === qualificationCode);
  }

  // 7. Assessment Methods
  getAssessmentMethods(qualificationCode) {
    if (!this.assessmentMethods) return [];
    if (!qualificationCode) return this.assessmentMethods;
    return this.assessmentMethods.filter(am => am.applicable_qualification === qualificationCode);
  }

  // 8. Assessment Rubrics
  getAssessmentRubrics(qualificationCode) {
    if (!this.assessmentRubrics) return [];
    if (!qualificationCode) return this.assessmentRubrics;
    return this.assessmentRubrics.filter(ar => ar.qualification_code === qualificationCode);
  }

  // 9. Evidence Requirements
  getEvidenceRequirements(qualificationCode) {
    if (!this.evidenceRequirements) return [];
    if (!qualificationCode) return this.evidenceRequirements;
    return this.evidenceRequirements.filter(er => er.applicable_to === qualificationCode);
  }

  // 10. Extraction Review Issues
  getExtractionReviewIssues() {
    return this.extractionReviewIssues || [];
  }

  addReviewIssue(issue) {
    const newIssue = {
      id: `ISSUE-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now())}`,
      created_at: new Date().toISOString(),
      status: 'pending_manual_review',
      ...issue
    };
    this.extractionReviewIssues = [newIssue, ...(this.extractionReviewIssues || [])];
    this.saveReviewIssues();
    return newIssue;
  }

  updateReviewIssueStatus(issueId, status, notes = '') {
    if (!this.extractionReviewIssues) return;
    this.extractionReviewIssues = this.extractionReviewIssues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status,
          resolution_notes: notes,
          resolved_at: new Date().toISOString()
        };
      }
      return issue;
    });
    this.saveReviewIssues();
  }

  // Correction and verification controls (Phase 5)
  // Preserves original extracted value and records correction
  correctQualification(id, correctedFields, newVerificationStatus = 'reviewed', notes = '') {
    const original = this.qualificationsIndex?.find(q => q.id === id);
    if (!original) return;

    this.corrections[id] = {
      qualification_id: id,
      correctedFields,
      verification_status: newVerificationStatus, // 'extracted' | 'reviewed' | 'verified'
      notes,
      corrected_at: new Date().toISOString(),
      original_values: {
        title: original.title,
        code: original.code,
        level: original.level,
        awarding_body: original.awarding_body,
        valid_till: original.valid_till
      }
    };

    this.saveCorrections();
  }

  updateVerificationStatus(id, status) {
    const existing = this.corrections[id] || { correctedFields: {}, original_values: {} };
    this.corrections[id] = {
      ...existing,
      qualification_id: id,
      verification_status: status, // 'extracted' | 'reviewed' | 'verified'
      status_updated_at: new Date().toISOString()
    };
    this.saveCorrections();
  }
}

export const dataRepository = new DataRepository();
