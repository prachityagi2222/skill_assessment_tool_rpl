import { getDb } from './offlineDb.js';
import { storage } from '../utils/storage.js';

// Sync Statuses:
// 'online' | 'offline' | 'pending' | 'failed' | 'synced'

class SyncService {
  constructor() {
    this.simulatedOffline = false;
    this.syncStatus = 'online'; // 'online' | 'offline' | 'pending' | 'failed' | 'synced'
    this.lastSyncTimestamp = null;
    this.lastSyncError = null;
    this.listeners = new Set();
    this.isSyncing = false;

    // Initialize network listeners in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.syncStatus = navigator.onLine ? 'online' : 'offline';
    }
  }

  // Check current effective connectivity
  isOnline() {
    if (this.simulatedOffline) return false;
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  // Set simulated offline mode for SIH Hackathon field evaluations
  setSimulatedOffline(isSimulatedOffline, autoSync = true) {
    this.simulatedOffline = isSimulatedOffline;
    if (this.simulatedOffline) {
      this.syncStatus = 'offline';
      this.notify();
      return Promise.resolve({ success: false, reason: 'offline' });
    } else {
      const isNetDown = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine;
      this.syncStatus = isNetDown ? 'offline' : 'online';
      this.notify();
      // Automatically attempt sync of pending operations when back online if requested
      if (autoSync) {
        return this.syncAll();
      }
      return Promise.resolve({ success: true });
    }
  }

  handleNetworkChange(isNetworkUp) {
    if (this.simulatedOffline) return; // Keep manual override

    if (isNetworkUp) {
      this.syncStatus = 'online';
      this.syncAll();
    } else {
      this.syncStatus = 'offline';
    }
    this.notify();
  }

  // Subscribe to sync state changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('[SyncService] Listener error:', err);
      }
    });
  }

  getState() {
    return {
      isOnline: this.isOnline(),
      simulatedOffline: this.simulatedOffline,
      syncStatus: this.syncStatus,
      lastSyncTimestamp: this.lastSyncTimestamp,
      lastSyncError: this.lastSyncError,
      isSyncing: this.isSyncing
    };
  }

  // Enqueue an idempotent sync operation
  async enqueueOperation({ entityType, entityId, action, payload, operationId = null }) {
    const database = getDb();
    const opId = operationId || `OP-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`)}`;
    const now = new Date().toISOString();

    const opRecord = {
      operationId: opId,
      entityType, // 'WORKER_DRAFT' | 'WORKER_SUBMIT' | 'ASSESSOR_DRAFT' | 'ASSESSOR_SIGN_OFF'
      entityId,
      action: action || 'UPSERT',
      payload: payload || {},
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      attemptCount: 0,
      lastError: null
    };

    try {
      if (database && database.syncQueue) {
        // Idempotent: check if operation with this ID or un-synced pending operation exists for same entity
        const existing = await database.syncQueue
          .where('entityId')
          .equals(entityId)
          .filter(op => op.status === 'pending' && op.entityType === entityType)
          .first();

        if (existing) {
          // Update existing pending operation without creating redundant queue entries
          await database.syncQueue.update(existing.operationId, {
            payload,
            updatedAt: now
          });
          opRecord.operationId = existing.operationId;
        } else {
          await database.syncQueue.put(opRecord);
        }
      }
    } catch (err) {
      console.warn('[SyncService] Enqueue fallback to memory/localStorage:', err);
      try {
        const queueRaw = localStorage.getItem('kaushalsetu_sync_queue_v1');
        const queue = queueRaw ? JSON.parse(queueRaw) : [];
        const filtered = queue.filter(q => !(q.entityId === entityId && q.status === 'pending'));
        filtered.push(opRecord);
        localStorage.setItem('kaushalsetu_sync_queue_v1', JSON.stringify(filtered));
      } catch {}
    }

    if (!this.isOnline()) {
      this.syncStatus = 'pending';
      this.notify();
      return { success: true, queued: true, operationId: opRecord.operationId, isOffline: true };
    }

    // If online, immediately process the queue
    return this.syncAll();
  }

  // Get count and items in pending sync queue
  async getPendingOperations() {
    const database = getDb();
    try {
      if (database && database.syncQueue) {
        return await database.syncQueue
          .where('status')
          .anyOf(['pending', 'failed'])
          .toArray();
      }
    } catch {}

    try {
      const queueRaw = localStorage.getItem('kaushalsetu_sync_queue_v1');
      if (queueRaw) {
        const queue = JSON.parse(queueRaw);
        return queue.filter(q => q.status === 'pending' || q.status === 'failed');
      }
    } catch {}

    return [];
  }

  // Process all queued operations (Simulated Cloud Sync for SIH Hackathon Demo)
  async syncAll({ forceFail = false } = {}) {
    if (this.syncPromise) return this.syncPromise;

    this.syncPromise = this._executeSync({ forceFail });
    try {
      return await this.syncPromise;
    } finally {
      this.syncPromise = null;
    }
  }

  async _executeSync({ forceFail = false } = {}) {
    if (!this.isOnline()) {
      this.syncStatus = 'offline';
      this.notify();
      return { success: false, reason: 'offline' };
    }

    this.isSyncing = true;
    this.notify();

    const database = getDb();
    let pendingOps = await this.getPendingOperations();

    if (pendingOps.length === 0) {
      this.syncStatus = 'synced';
      this.isSyncing = false;
      this.lastSyncTimestamp = new Date().toLocaleTimeString();
      this.notify();
      return { success: true, syncedCount: 0 };
    }

    let successCount = 0;
    let failureCount = 0;

    for (const op of pendingOps) {
      try {
        if (forceFail) {
          throw new Error('Simulated network timeout (SIH demo test)');
        }

        // Execute idempotent dispatch
        await this.dispatchOperation(op);

        // Update operation status to 'synced'
        op.status = 'synced';
        op.updatedAt = new Date().toISOString();
        op.attemptCount = (op.attemptCount || 0) + 1;
        op.lastError = null;

        if (database && database.syncQueue) {
          await database.syncQueue.put(op);
        }
        successCount++;
      } catch (err) {
        op.status = 'failed';
        op.updatedAt = new Date().toISOString();
        op.attemptCount = (op.attemptCount || 0) + 1;
        op.lastError = err.message || 'Synchronization failed';

        if (database && database.syncQueue) {
          await database.syncQueue.put(op);
        }
        failureCount++;
        this.lastSyncError = err.message;
      }
    }

    this.isSyncing = false;
    if (failureCount > 0) {
      this.syncStatus = 'failed';
    } else {
      this.syncStatus = 'synced';
      this.lastSyncTimestamp = new Date().toLocaleTimeString();
    }
    this.notify();

    return {
      success: failureCount === 0,
      syncedCount: successCount,
      failedCount: failureCount,
      lastError: this.lastSyncError
    };
  }

  // Idempotent dispatch of individual operation
  async dispatchOperation(op) {
    // Note: In SIH Hackathon Prototype mode, this executes the simulated cloud sync
    // by reconciling client-side records with the primary candidate/evaluations store
    const candidates = storage.getCandidates();
    const candidateIndex = candidates.findIndex(c => c.id === op.entityId);

    // Conflict Check: Check if candidate status on stored state was marked in conflict
    if (candidateIndex !== -1) {
      const stored = candidates[candidateIndex];
      // If candidate was marked cancelled/disputed elsewhere while local had changes
      if (stored.hasConflict || (stored.status === 'REJECTED' && op.action === 'SUBMIT')) {
        await this.recordConflict(op, stored, 'Remote candidate status was closed while local application was drafted.');
        throw new Error('Conflict detected: Remote candidate state modified concurrently.');
      }
    }

    if (op.entityType === 'WORKER_SUBMIT' || op.entityType === 'WORKER_DRAFT') {
      const payload = op.payload || {};
      if (candidateIndex !== -1) {
        // Idempotent update: never create duplicate candidate IDs
        candidates[candidateIndex] = {
          ...candidates[candidateIndex],
          name: payload.fullName || candidates[candidateIndex].name,
          currentRoleName: payload.trade || candidates[candidateIndex].currentRoleName,
          yearsExperience: payload.yearsExperience || candidates[candidateIndex].yearsExperience,
          location: payload.location || candidates[candidateIndex].location,
          status: op.entityType === 'WORKER_SUBMIT' ? 'SUBMITTED' : candidates[candidateIndex].status,
          lastSyncAt: new Date().toISOString()
        };
      } else if (op.entityId && op.entityId.startsWith('CAND-')) {
        // Upsert by stable entityId
        candidates.push({
          id: op.entityId,
          name: payload.fullName || 'New Candidate',
          currentRoleName: payload.trade || 'Vocational Worker',
          yearsExperience: payload.yearsExperience || 2,
          location: payload.location || 'India',
          status: op.entityType === 'WORKER_SUBMIT' ? 'SUBMITTED' : 'DRAFT',
          evidenceList: payload.evidenceList || [],
          lastSyncAt: new Date().toISOString()
        });
      }
      storage.saveCandidates(candidates);
    } else if (op.entityType === 'ASSESSOR_DRAFT' || op.entityType === 'ASSESSOR_SIGN_OFF') {
      // Reconcile assessor dossier
      const database = getDb();
      if (database && database.assessorDrafts) {
        const draft = await database.assessorDrafts.get(op.entityId);
        if (draft) {
          await database.assessorDrafts.update(op.entityId, {
            syncStatus: 'synced',
            lastSyncAt: new Date().toISOString()
          });
        }
      }
    }

    return true;
  }

  // Conflict recording helper
  async recordConflict(op, remoteRecord, reason) {
    const database = getDb();
    const conflictId = `CONF-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now())}`;
    const record = {
      id: conflictId,
      entityType: op.entityType,
      entityId: op.entityId,
      localVersion: op.payload,
      remoteVersion: remoteRecord,
      conflictReason: reason,
      detectedAt: new Date().toISOString(),
      resolved: false
    };

    try {
      if (database && database.conflictRecords) {
        await database.conflictRecords.put(record);
      }
    } catch {}

    return record;
  }

  // Retry a specific operation idempotently
  async retryOperation(operationId) {
    const database = getDb();
    if (!database || !database.syncQueue) return false;

    const op = await database.syncQueue.get(operationId);
    if (!op) return false;

    op.status = 'pending';
    await database.syncQueue.put(op);
    return this.syncAll();
  }
}

export const syncService = new SyncService();
