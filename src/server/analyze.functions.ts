import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  mode: z.enum(["text", "image"]),
  description: z.string().min(1).max(4000),
  sport: z.string().max(40).optional(),
  level: z.string().max(40).optional(),
  goal: z.string().max(40).optional(),
  imageDataUrl: z.string().max(2_500_000).optional(),
});

export type AnalysisResult = {
  score: number;
  headline: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  plan: { day: string; focus: string; duration: string }[];
  bodyMarkers: { label: string; x: number; y: number; status: "good" | "watch" | "fix" }[];
};

const TOOL = {
  type: "function" as const,
  function: {
    name: "submit_analysis",
    description: "Return structured athletic performance analysis",
    parameters: {
      type: "object",
      properties: {
        score: { type: "integer", minimum: 0, maximum: 100 },
        headline: { type: "string" },
        strengths: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
        weaknesses: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
        improvements: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        plan: {
          type: "array", minItems: 5, maxItems: 7,
          items: {
            type: "object",
            properties: {
              day: { type: "string" },
              focus: { type: "string" },
              duration: { type: "string" },
            },
            required: ["day", "focus", "duration"],
          },
        },
        bodyMarkers: {
          type: "array", minItems: 4, maxItems: 8,
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              x: { type: "number", minimum: 0, maximum: 100 },
              y: { type: "number", minimum: 0, maximum: 100 },
              status: { type: "string", enum: ["good", "watch", "fix"] },
            },
            required: ["label", "x", "y", "status"],
          },
        },
      },
      required: ["score", "headline", "strengths", "weaknesses", "improvements", "plan", "bodyMarkers"],
    },
  },
};

export const analyzePerformance = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: true; result: AnalysisResult } | { ok: false; error: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, error: "AI service is not configured." };

    const system = `You are an elite, calm, precise sports performance coach for CourtMind Elite.
Sport: ${data.sport ?? "general athletics"}. Level: ${data.level ?? "intermediate"}. Goal: ${data.goal ?? "performance"}.
Be focused, professional, encouraging. Body marker (x,y) are percentages on a frontal-facing athlete silhouette where x=0 left edge, x=100 right; y=0 head, y=100 feet. Place markers on relevant joints/muscles.`;

    const userContent: any[] = [
      { type: "text", text: data.description || "Analyze this training session." },
    ];
    if (data.mode === "image" && data.imageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: data.imageDataUrl } });
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userContent },
          ],
          tools: [TOOL],
          tool_choice: { type: "function", function: { name: "submit_analysis" } },
        }),
      });

      if (res.status === 429) return { ok: false, error: "Too many requests. Please try again in a moment." };
      if (res.status === 402) return { ok: false, error: "AI credits required. Add credits in workspace settings." };
      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway:", res.status, t);
        return { ok: false, error: "Analysis failed. Please try again." };
      }

      const json = await res.json();
      const call = json.choices?.[0]?.message?.tool_calls?.[0];
      if (!call?.function?.arguments) return { ok: false, error: "No analysis returned." };
      const parsed = JSON.parse(call.function.arguments) as AnalysisResult;
      return { ok: true, result: parsed };
    } catch (e) {
      console.error("analyze error:", e);
      return { ok: false, error: "Unexpected error during analysis." };
    }
  });
