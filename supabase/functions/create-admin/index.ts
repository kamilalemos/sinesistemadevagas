import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, action, target_user_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Extract caller user from Authorization header
    const authHeader = req.headers.get('Authorization');
    let callerUserId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || '';
      const userClient = createClient(supabaseUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      const { data: { user } } = await userClient.auth.getUser();
      callerUserId = user?.id || null;
    }

    // Helper: require admin
    const requireAdmin = async () => {
      if (!callerUserId) {
        return { error: "Não autenticado", status: 401 };
      }
      const { data: callerRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', callerUserId)
        .eq('role', 'admin')
        .limit(1);
      if (!callerRole || callerRole.length === 0) {
        return { error: "Apenas administradores podem realizar esta ação", status: 403 };
      }
      return null;
    };

    // ACTION: list-admins
    if (action === 'list-admins') {
      const adminCheck = await requireAdmin();
      if (adminCheck) {
        return new Response(JSON.stringify({ error: adminCheck.error }), {
          status: adminCheck.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: roles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');

      if (rolesError) {
        return new Response(JSON.stringify({ error: rolesError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user emails from auth
      const admins = [];
      for (const r of (roles || [])) {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
        admins.push({
          user_id: r.user_id,
          email: user?.email || 'Desconhecido',
          created_at: user?.created_at || null,
        });
      }

      return new Response(JSON.stringify({ admins }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: delete-admin
    if (action === 'delete-admin') {
      const adminCheck = await requireAdmin();
      if (adminCheck) {
        return new Response(JSON.stringify({ error: adminCheck.error }), {
          status: adminCheck.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!target_user_id) {
        return new Response(JSON.stringify({ error: "ID do usuário é obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (target_user_id === callerUserId) {
        return new Response(JSON.stringify({ error: "Você não pode remover a si mesmo" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Remove role
      const { error: deleteRoleError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', target_user_id)
        .eq('role', 'admin');

      if (deleteRoleError) {
        return new Response(JSON.stringify({ error: deleteRoleError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Delete auth user
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(target_user_id);
      if (deleteUserError) {
        return new Response(JSON.stringify({ error: deleteUserError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Admin removido com sucesso" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: change-password
    if (action === 'change-password') {
      if (!callerUserId) {
        return new Response(JSON.stringify({ error: "Não autenticado" }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!password || password.length < 6) {
        return new Response(JSON.stringify({ error: "Senha deve ter pelo menos 6 caracteres" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(callerUserId, { password });
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Senha alterada com sucesso" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default action: create admin
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email e senha são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: existingAdmins } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      const adminCheck = await requireAdmin();
      if (adminCheck) {
        return new Response(JSON.stringify({ error: adminCheck.error }), {
          status: adminCheck.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userData.user.id, role: 'admin' });

    if (roleError) {
      return new Response(JSON.stringify({ error: roleError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Admin criado com sucesso" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
