import { supabase } from "@/integrations/supabase/client";

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
    const userSession = localStorage.getItem("sine_admin_session");
    const user = userSession ? JSON.parse(userSession) : null;
    
    console.log(`[AUDIT] Action: ${action}, Entity: ${entity_type}, ID: ${entity_id}, User: ${user?.email || 'anonymous'}`);

    const localLogs = JSON.parse(localStorage.getItem('sine_local_audit_logs') || '[]');
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
    localStorage.setItem('sine_local_audit_logs', JSON.stringify(localLogs.slice(-100)));
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
};
