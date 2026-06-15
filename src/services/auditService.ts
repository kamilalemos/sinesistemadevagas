import { STORAGE_KEYS } from "@/constants/storageKeys";

export type AuditAction = 'create' | 'update' | 'delete' | 'export' | 'publish' | 'reset';
export type AuditEntity = 'vaga' | 'configuracao' | 'periodo' | 'banner' | 'popup';

// Local-only version of audit logging
export const logAudit = async (
  action: AuditAction,
  entity_type: AuditEntity,
  entity_id?: string,
  details?: any
) => {
  try {
    const userSession = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    const user = userSession ? JSON.parse(userSession) : null;

    console.log(`[AUDIT] Action: ${action}, Entity: ${entity_type}, ID: ${entity_id}, User: ${user?.email || 'anonymous'}`);

    const localLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    localLogs.push({
      id: crypto.randomUUID(),
      action,
      entity_type,
      entity_id,
      details,
      user_email: user?.email,
      created_at: new Date().toISOString()
    });

    // Keep last 100 logs
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(localLogs.slice(-100)));
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
};
