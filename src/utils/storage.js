import { INITIAL_CANDIDATES, INITIAL_ASSESSORS, INITIAL_AUDIT_LOGS } from '../data/initialData.js';

const STORAGE_KEYS = {
  CANDIDATES: 'kaushalsetu_candidates_v1',
  ASSESSORS: 'kaushalsetu_assessors_v1',
  AUDIT_LOGS: 'kaushalsetu_audit_logs_v1',
  ACTIVE_ROLE: 'kaushalsetu_active_role_v1',
  ACTIVE_CANDIDATE_ID: 'kaushalsetu_active_cand_id_v1',
  ACTIVE_ASSESSOR_ID: 'kaushalsetu_active_assessor_id_v1',
  VIEW_MODE: 'kaushalsetu_view_mode_v1', // 'mobile' | 'full'
  LANGUAGE: 'kaushalsetu_language_v1'
};

const memoryStore = {};

const safeGet = (key) => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] || null;
};

const safeSet = (key, val) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch {}
  memoryStore[key] = val;
};

export const storage = {
  getCandidates: () => {
    try {
      const data = safeGet(STORAGE_KEYS.CANDIDATES);
      if (!data) return INITIAL_CANDIDATES;
      const parsed = JSON.parse(data);
      // DEV-only auto-seed: merge newly added demo candidates (e.g. CAND-2026-005).
      // In production (PROD=true) never auto-inject demo records.
      if ((import.meta?.env?.DEV ?? true)) {
        const existingIds = new Set(parsed.map(c => c.id));
        const missing = INITIAL_CANDIDATES.filter(c => !existingIds.has(c.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          safeSet(STORAGE_KEYS.CANDIDATES, JSON.stringify(merged));
          return merged;
        }
      }
      return parsed;
    } catch {
      return INITIAL_CANDIDATES;
    }
  },
  saveCandidates: (candidates) => {
    try {
      safeSet(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    } catch (e) {
      console.error('Failed to save candidates', e);
    }
  },

  getAssessors: () => {
    try {
      const data = safeGet(STORAGE_KEYS.ASSESSORS);
      return data ? JSON.parse(data) : INITIAL_ASSESSORS;
    } catch {
      return INITIAL_ASSESSORS;
    }
  },
  saveAssessors: (assessors) => {
    try {
      safeSet(STORAGE_KEYS.ASSESSORS, JSON.stringify(assessors));
    } catch (e) {
      console.error('Failed to save assessors', e);
    }
  },

  getAuditLogs: () => {
    try {
      const data = safeGet(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },
  saveAuditLogs: (logs) => {
    try {
      safeSet(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save audit logs', e);
    }
  },

  getActiveRole: () => {
    try {
      return safeGet(STORAGE_KEYS.ACTIVE_ROLE) || 'welcome';
    } catch {
      return 'welcome';
    }
  },
  setActiveRole: (role) => {
    try {
      safeSet(STORAGE_KEYS.ACTIVE_ROLE, role);
    } catch (e) {
      console.error('Failed to set active role', e);
    }
  },

  getActiveCandidateId: () => {
    try {
      return safeGet(STORAGE_KEYS.ACTIVE_CANDIDATE_ID) || ((import.meta?.env?.DEV ?? true) ? 'CAND-2026-001' : null);
    } catch {
      return ((import.meta?.env?.DEV ?? true) ? 'CAND-2026-001' : null);
    }
  },
  setActiveCandidateId: (id) => {
    try {
      safeSet(STORAGE_KEYS.ACTIVE_CANDIDATE_ID, id);
    } catch (e) {
      console.error('Failed to set candidate id', e);
    }
  },

  getActiveAssessorId: () => {
    try {
      return safeGet(STORAGE_KEYS.ACTIVE_ASSESSOR_ID) || ((import.meta?.env?.DEV ?? true) ? 'ASSESSOR-101' : null);
    } catch {
      return ((import.meta?.env?.DEV ?? true) ? 'ASSESSOR-101' : null);
    }
  },
  setActiveAssessorId: (id) => {
    try {
      safeSet(STORAGE_KEYS.ACTIVE_ASSESSOR_ID, id);
    } catch (e) {
      console.error('Failed to set assessor id', e);
    }
  },

  getViewMode: () => {
    try {
      return safeGet(STORAGE_KEYS.VIEW_MODE) || 'mobile';
    } catch {
      return 'mobile';
    }
  },
  setViewMode: (mode) => {
    try {
      safeSet(STORAGE_KEYS.VIEW_MODE, mode);
    } catch (e) {
      console.error('Failed to set view mode', e);
    }
  },

  getLanguage: () => {
    try {
      return safeGet(STORAGE_KEYS.LANGUAGE) || 'en';
    } catch {
      return 'en';
    }
  },
  setLanguage: (lang) => {
    try {
      safeSet(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('Failed to set language', e);
    }
  },

  resetAllData: () => {
    try {
      safeSet(STORAGE_KEYS.CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
      safeSet(STORAGE_KEYS.ASSESSORS, JSON.stringify(INITIAL_ASSESSORS));
      safeSet(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    } catch (e) {
      console.error('Failed to reset data', e);
    }
  }
};
