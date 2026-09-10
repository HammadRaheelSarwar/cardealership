import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const REALTIME_TABLES = [
  "dealership_memberships",
  "manager_team_members",
  "lead_sources",
  "pipeline_stages",
  "customers",
  "vehicles",
  "vehicle_images",
  "leads",
  "lead_stage_history",
  "conversations",
  "messages",
  "activities",
  "tasks",
  "appointments",
  "notes",
  "sales_records",
  "automations",
  "automation_steps",
  "automation_runs",
  "automation_logs",
  "message_templates",
  "audit_logs",
] as const;
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const tenant = useAuthStore((s) => s.activeDealershipId);
  const client = useQueryClient();
  useEffect(() => {
    let active = true;
    async function restore() {
      if (!useAuthStore.getState().user) {
        if (active) setReady(true);
        return;
      }
      try {
        const token = (await api.post("/auth/refresh")).data.data.accessToken;
        useAuthStore.getState().setAccessToken(token);
        const data = (await api.get("/auth/me")).data.data;
        if (active)
          useAuthStore.getState().setAuth({ ...data, accessToken: token });
      } catch {
        if (active) useAuthStore.getState().logout();
      } finally {
        if (active) setReady(true);
      }
    }
    restore();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    client.removeQueries({
      predicate: (query) => query.queryKey[0] !== tenant,
    });
  }, [tenant, client]);
  useEffect(() => {
    const refresh = () => {
      void client.invalidateQueries();
    };
    window.addEventListener("crm:data-changed", refresh);
    return () => window.removeEventListener("crm:data-changed", refresh);
  }, [client]);
  useEffect(() => {
    const realtime = supabase;
    if (!tenant || !realtime) return;

    const channel = realtime.channel(`dealership:${tenant}`);
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
      },
      () => {
        void client.invalidateQueries();
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "dealerships",
        filter: `id=eq.${tenant}`,
      },
      () => {
        void client.invalidateQueries();
      },
    );
    for (const table of REALTIME_TABLES) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `dealership_id=eq.${tenant}`,
        },
        () => {
          void client.invalidateQueries();
        },
      );
    }
    channel.subscribe();

    return () => {
      void realtime.removeChannel(channel);
    };
  }, [tenant, client]);
  return ready ? (
    <>
      {!isSupabaseConfigured && (
        <div
          role="alert"
          className="fixed inset-x-0 top-0 z-[100] bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black"
        >
          Live updates are unavailable. Set VITE_SUPABASE_URL and
          VITE_SUPABASE_ANON_KEY in Vercel, then redeploy.
        </div>
      )}
      {children}
    </>
  ) : (
    <div className="p-8 text-gray-400">Restoring session…</div>
  );
}
