import Dexie from 'dexie';

// Polyfill IndexedDB in Node.js automated test environments if native indexedDB is missing
// DEV-only: fake-indexeddb is a devDependency and must never land in the production bundle;
// top-level await also breaks old WebViews, so gate the polyfill behind DEV (default true in Node tests).
if ((import.meta?.env?.DEV ?? true) && typeof window === 'undefined' && typeof indexedDB === 'undefined') {
  try {
    await import('fake-indexeddb/auto');
  } catch {}
}

// KaushalSetu Offline Database for RPL Mobile-First Field Assessments
// Structured persistence using IndexedDB (via Dexie) for unreliable connectivity areas.

export const MAX_EVIDENCE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB mobile safety threshold
export const ALLOWED_EVIDENCE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'webm', 'wav', 'mp3', 'ogg', 'm4a'];

export class KaushalSetuDatabase extends Dexie {
  constructor(options = {}) {
    super('KaushalSetuOfflineDB', options);

    // Schema definition version 1
    this.version(1).stores({
      // Worker application drafts
      workerDrafts: 'id, candidateId, status, updatedAt, syncStatus',

      // Assessor assessment drafts, rubrics & observations
      assessorDrafts: 'candidateId, qualificationId, status, updatedAt, syncStatus',

      // Pending idempotent synchronization operations
      syncQueue: 'operationId, entityType, entityId, status, createdAt, attemptCount',

      // Version conflict records requiring manual review
      conflictRecords: 'id, entityType, entityId, detectedAt, resolved'
    });
  }
}

// Global Dexie instance (with graceful fallback support)
let dbInstance = null;

export const getDb = () => {
  if (typeof indexedDB === 'undefined') {
    return null;
  }
  if (!dbInstance) {
    dbInstance = new KaushalSetuDatabase();
  }
  return dbInstance;
};

export const db = typeof indexedDB !== 'undefined' ? getDb() : null;

// Evidence file validation helper
export const validateEvidenceFile = (fileOrBlob, fileName = '') => {
  if (!fileOrBlob) {
    return { valid: false, error: 'No file data provided.' };
  }

  const size = fileOrBlob.size || (fileOrBlob.length ? fileOrBlob.length : 0);
  const name = fileName || fileOrBlob.name || 'unnamed_upload';
  const ext = name.split('.').pop().toLowerCase();

  // 0. Zero-byte check
  if (!size || size <= 0) {
    return {
      valid: false,
      error: 'File is empty (0 bytes). Please choose a valid photo, document, or audio file.',
      sizeBytes: size,
      name
    };
  }

  // 1. File size check
  if (size > MAX_EVIDENCE_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB offline safety limit. Mobile browsers may discard oversized offline records. Please compress or shorten the file.`,
      sizeBytes: size,
      name
    };
  }

  // 2. Type / extension check
  if (ext && !ALLOWED_EVIDENCE_EXTENSIONS.includes(ext) && !fileOrBlob.type?.startsWith('image/') && !fileOrBlob.type?.startsWith('audio/')) {
    return {
      valid: false,
      error: `File type .${ext} is not supported. Please upload photos (JPG, PNG), documents (PDF), or voice notes (WEBM, WAV, MP3).`,
      sizeBytes: size,
      name
    };
  }

  return {
    valid: true,
    sizeBytes: size,
    readableSize: size > 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`,
    name
  };
};

// Database CRUD and Adapter Utilities for Worker Drafts
export const offlineDbService = {
  // Save or update worker draft in IndexedDB
  async saveWorkerDraft(candidateId, draftData, options = {}) {
    const database = getDb();
    const draftId = draftData.id || `DRAFT-WKR-${candidateId || 'NEW'}`;
    const now = new Date().toISOString();

    const record = {
      id: draftId,
      candidateId: candidateId || ((import.meta?.env?.DEV ?? true) ? 'CAND-2026-001' : null),
      formData: draftData.formData || {},
      declaredSkills: draftData.declaredSkills || [],
      evidenceList: draftData.evidenceList || [],
      status: draftData.status || 'DRAFT',
      updatedAt: now,
      syncStatus: options.syncStatus || 'local_saved',
      version: (draftData.version || 0) + 1
    };

    try {
      if (database && database.workerDrafts) {
        await database.workerDrafts.put(record);
      }
    } catch (err) {
      if (err?.name !== 'MissingAPIError' && err?.name !== 'DatabaseClosedError') {
        console.warn('[OfflineDB] IndexedDB worker draft save fallback:', err);
      }
    }

    // NOTE: No localStorage mirror of full payload (quota blowup risk).
    // IndexedDB is the source of truth; keep only a tiny index for legacy hydration.
    try {
      localStorage.setItem('kaushalsetu_worker_application_draft_index_v1', JSON.stringify({
        id: record.id,
        candidateId: record.candidateId,
        updatedAt: record.updatedAt,
        version: record.version,
        syncStatus: record.syncStatus
      }));
    } catch {}

    return record;
  },

  // Retrieve worker draft by candidate ID or default draft key
  async getWorkerDraft(candidateId) {
    const database = getDb();
    try {
      if (database && database.workerDrafts) {
        const found = await database.workerDrafts.where('candidateId').equals(candidateId).first();
        if (found) return found;
      }
    } catch (err) {
      if (err?.name !== 'MissingAPIError' && err?.name !== 'DatabaseClosedError') {
        console.warn('[OfflineDB] IndexedDB getWorkerDraft fallback:', err);
      }
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem('kaushalsetu_worker_application_draft_v1');
      if (raw) return JSON.parse(raw);
    } catch {}

    return null;
  },

  // Save or update assessor draft in IndexedDB
  async saveAssessorDraft(candidateId, evaluationDossier, options = {}) {
    const database = getDb();
    const now = new Date().toISOString();

    const record = {
      candidateId,
      qualificationId: evaluationDossier.qualification?.id || 'UNSPECIFIED',
      qualification: evaluationDossier.qualification || null,
      curriculumVersion: evaluationDossier.curriculumVersion || null,
      criteriaAssessments: evaluationDossier.criteriaAssessments || {},
      evidenceReviews: evaluationDossier.evidenceReviews || {},
      assessorNotes: evaluationDossier.assessorNotes || '',
      recommendation: evaluationDossier.recommendation || '',
      recommendationRationale: evaluationDossier.recommendationRationale || '',
      revisionHistory: evaluationDossier.revisionHistory || [],
      rubricMode: evaluationDossier.rubricMode || 'provisional_4_level',
      finalVerdict: evaluationDossier.finalVerdict || null,
      status: evaluationDossier.status || 'in_progress',
      updatedAt: now,
      syncStatus: options.syncStatus || 'local_saved',
      version: (evaluationDossier.version || 0) + 1
    };

    try {
      if (database && database.assessorDrafts) {
        await database.assessorDrafts.put(record);
      }
    } catch (err) {
      if (err?.name !== 'MissingAPIError' && err?.name !== 'DatabaseClosedError') {
        console.warn('[OfflineDB] IndexedDB assessor draft save fallback:', err);
      }
    }

    // NOTE: No localStorage mirror of full dossier (quota blowup risk).
    // Keep only a tiny per-candidate index; full record lives in IndexedDB.
    try {
      const existing = localStorage.getItem('kaushalsetu_assessor_evaluations_index_v1');
      const parsed = existing ? JSON.parse(existing) : {};
      parsed[candidateId] = {
        candidateId,
        qualificationId: record.qualificationId,
        updatedAt: record.updatedAt,
        version: record.version,
        syncStatus: record.syncStatus
      };
      localStorage.setItem('kaushalsetu_assessor_evaluations_index_v1', JSON.stringify(parsed));
    } catch {}

    return record;
  },

  // Retrieve assessor draft
  async getAssessorDraft(candidateId) {
    const database = getDb();
    try {
      if (database && database.assessorDrafts) {
        const record = await database.assessorDrafts.get(candidateId);
        if (record) return record;
      }
    } catch (err) {
      if (err?.name !== 'MissingAPIError' && err?.name !== 'DatabaseClosedError') {
        console.warn('[OfflineDB] IndexedDB getAssessorDraft fallback:', err);
      }
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem('kaushalsetu_assessor_evaluations_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed[candidateId] || null;
      }
    } catch {}

    return null;
  },

  // Clear offline data (for sign out or data reset)
  async clearAllOfflineData(preserveDemoSeeds = true) {
    const database = getDb();
    try {
      if (database) {
        await database.workerDrafts?.clear();
        await database.assessorDrafts?.clear();
        await database.syncQueue?.clear();
        await database.conflictRecords?.clear();
      }
    } catch (err) {
      console.warn('[OfflineDB] Clear tables error:', err);
    }

    localStorage.removeItem('kaushalsetu_worker_application_draft_v1');
    localStorage.removeItem('kaushalsetu_sync_queue_v1');
    if (!preserveDemoSeeds) {
      localStorage.removeItem('kaushalsetu_assessor_evaluations_v2');
    }
  }
};
