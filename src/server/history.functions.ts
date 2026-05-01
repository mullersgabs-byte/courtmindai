import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AnalysisRow = {
  id: string;
  created_at: string;
  status: string;
  verdict: string | null;
  overall_score: number | null;
  events: Array<{ time_seconds: number; type: "good" | "warn" | "bad"; title: string; detail: string }> | null;
  video_url: string;
};

export const listAnalyses = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select("id, created_at, status, verdict, overall_score, events, video_url")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("listAnalyses error", error);
      return { analyses: [] as AnalysisRow[], error: error.message };
    }
    return { analyses: (data || []) as AnalysisRow[], error: null };
  } catch (e) {
    console.error("listAnalyses crash", e);
    return { analyses: [] as AnalysisRow[], error: "Could not load history." };
  }
});
