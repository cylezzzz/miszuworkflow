/**
 * IndexedDB Wrapper für lokale Persistenz
 * Speichert Workflows, Nodes, Edges, Settings lokal im Browser
 */

import type { Workflow, Node, Edge } from './types';

const DB_NAME = 'MISZU_WorkflowDB';
const DB_VERSION = 1;

// Store Names
const STORES = {
  WORKFLOWS: 'workflows',
  TEMPLATES: 'templates',
  SETTINGS: 'settings',
  HISTORY: 'history',
} as const;

export type WorkflowRecord = Workflow & {
  createdAt: string;
  updatedAt: string;
};

export type TemplateRecord = {
  id: string;
  name: string;
  description: string;
  category: string;
  workflow: Workflow;
  thumbnail?: string;
  createdAt: string;
};

export type HistoryRecord = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  completedAt?: string;
  duration?: string;
  error?: string;
};

export type SettingsRecord = {
  key: string;
  value: any;
};

class WorkflowDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialisiert die Datenbank
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Workflows Store
        if (!db.objectStoreNames.contains(STORES.WORKFLOWS)) {
          const workflowStore = db.createObjectStore(STORES.WORKFLOWS, { keyPath: 'id' });
          workflowStore.createIndex('name', 'name', { unique: false });
          workflowStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          workflowStore.createIndex('verificationStatus', 'verificationStatus', { unique: false });
        }

        // Templates Store
        if (!db.objectStoreNames.contains(STORES.TEMPLATES)) {
          const templateStore = db.createObjectStore(STORES.TEMPLATES, { keyPath: 'id' });
          templateStore.createIndex('category', 'category', { unique: false });
          templateStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Settings Store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // History Store
        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
          historyStore.createIndex('workflowId', 'workflowId', { unique: false });
          historyStore.createIndex('startedAt', 'startedAt', { unique: false });
          historyStore.createIndex('status', 'status', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Stellt sicher, dass DB initialisiert ist
   */
  private async ensureDB(): Promise<IDBDatabase> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  /**
   * Generic Get Operation
   */
  private async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic Put Operation
   */
  private async put<T>(storeName: string, value: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic Delete Operation
   */
  private async delete(storeName: string, key: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic GetAll Operation
   */
  private async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all by index
   */
  private async getAllByIndex<T>(
    storeName: string, 
    indexName: string, 
    query?: IDBValidKey | IDBKeyRange
  ): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = query ? index.getAll(query) : index.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // ===== WORKFLOW OPERATIONS =====

  async saveWorkflow(workflow: Workflow): Promise<void> {
    const record: WorkflowRecord = {
      ...workflow,
      updatedAt: new Date().toISOString(),
      createdAt: workflow.id ? 
        (await this.getWorkflow(workflow.id))?.createdAt || new Date().toISOString() :
        new Date().toISOString(),
    };
    await this.put(STORES.WORKFLOWS, record);
  }

  async getWorkflow(id: string): Promise<WorkflowRecord | null> {
    return this.get<WorkflowRecord>(STORES.WORKFLOWS, id);
  }

  async getAllWorkflows(): Promise<WorkflowRecord[]> {
    const workflows = await this.getAll<WorkflowRecord>(STORES.WORKFLOWS);
    return workflows.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.delete(STORES.WORKFLOWS, id);
  }

  async searchWorkflows(query: string): Promise<WorkflowRecord[]> {
    const all = await this.getAllWorkflows();
    const lowerQuery = query.toLowerCase();
    return all.filter(w => 
      w.name.toLowerCase().includes(lowerQuery) ||
      w.description?.toLowerCase().includes(lowerQuery)
    );
  }

  // ===== TEMPLATE OPERATIONS =====

  async saveTemplate(template: TemplateRecord): Promise<void> {
    await this.put(STORES.TEMPLATES, template);
  }

  async getTemplate(id: string): Promise<TemplateRecord | null> {
    return this.get<TemplateRecord>(STORES.TEMPLATES, id);
  }

  async getAllTemplates(): Promise<TemplateRecord[]> {
    return this.getAll<TemplateRecord>(STORES.TEMPLATES);
  }

  async getTemplatesByCategory(category: string): Promise<TemplateRecord[]> {
    return this.getAllByIndex<TemplateRecord>(STORES.TEMPLATES, 'category', category);
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.delete(STORES.TEMPLATES, id);
  }

  // ===== HISTORY OPERATIONS =====

  async addHistory(record: HistoryRecord): Promise<void> {
    await this.put(STORES.HISTORY, record);
  }

  async getHistory(id: string): Promise<HistoryRecord | null> {
    return this.get<HistoryRecord>(STORES.HISTORY, id);
  }

  async getAllHistory(): Promise<HistoryRecord[]> {
    const history = await this.getAll<HistoryRecord>(STORES.HISTORY);
    return history.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async getHistoryByWorkflow(workflowId: string): Promise<HistoryRecord[]> {
    return this.getAllByIndex<HistoryRecord>(STORES.HISTORY, 'workflowId', workflowId);
  }

  async deleteHistory(id: string): Promise<void> {
    await this.delete(STORES.HISTORY, id);
  }

  async clearHistory(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.HISTORY, 'readwrite');
      const store = transaction.objectStore(STORES.HISTORY);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ===== SETTINGS OPERATIONS =====

  async getSetting<T = any>(key: string): Promise<T | null> {
    const record = await this.get<SettingsRecord>(STORES.SETTINGS, key);
    return record ? record.value : null;
  }

  async setSetting<T = any>(key: string, value: T): Promise<void> {
    await this.put(STORES.SETTINGS, { key, value });
  }

  async deleteSetting(key: string): Promise<void> {
    await this.delete(STORES.SETTINGS, key);
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await this.getAll<SettingsRecord>(STORES.SETTINGS);
    return settings.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Export all data als JSON
   */
  async exportAll(): Promise<string> {
    const data = {
      workflows: await this.getAllWorkflows(),
      templates: await this.getAllTemplates(),
      history: await this.getAllHistory(),
      settings: await this.getAllSettings(),
      exportedAt: new Date().toISOString(),
      version: DB_VERSION,
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   */
  async importAll(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    // Import workflows
    if (data.workflows) {
      for (const workflow of data.workflows) {
        await this.saveWorkflow(workflow);
      }
    }

    // Import templates
    if (data.templates) {
      for (const template of data.templates) {
        await this.saveTemplate(template);
      }
    }

    // Import history
    if (data.history) {
      for (const record of data.history) {
        await this.addHistory(record);
      }
    }

    // Import settings
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await this.setSetting(key, value);
      }
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    const stores = [STORES.WORKFLOWS, STORES.TEMPLATES, STORES.HISTORY, STORES.SETTINGS];

    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Singleton instance
export const workflowDB = new WorkflowDB();

// Initialize on import
if (typeof window !== 'undefined') {
  workflowDB.init().catch(console.error);
}
