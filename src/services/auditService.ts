import { supabase } from "@/integrations/supabase/client";

export type AuditAction = 'create' | 'update' | 'delete' | 'export' | 'publish' | 'reset';
export type AuditEntity = 'vaga' | 'configuracao' | 'periodo' | 'banner' | 'popup';

export const logAudit = async (
  action: AuditAction,
  entity_type: AuditEntity,
  entity_id?: string,
  details?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fallback log to console if no user is authenticated (should not happen in admin)
    console.log(`[AUDIT] Action: ${action}, Entity: ${entity_type}, ID: ${entity_id}, User: ${user?.id || 'anonymous'}`);

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action,
      entity_type,
      entity_id,
      details,
    });

    if (error) {
      console.error('Error saving audit log to Supabase:', error);
      // Fallback: save to localStorage if DB fails
      const localLogs = JSON.parse(localStorage.getItem('sine_local_audit_logs') || '[]');
      localLogs.push({
        action,
        entity_type,
        entity_id,
        details,
        user_id: user?.id,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('sine_local_audit_logs', JSON.stringify(localLogs.slice(-100))); // Keep last 100
    }
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
};
