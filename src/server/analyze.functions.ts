import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAuthFn } from "./auth-fn-middleware";

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
  .middleware([requireAuthFn])
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

/* ============================================================
 * VIDEO ANALYSIS — uploads + Gemini multimodal
 * ============================================================ */

const VideoInputSchema = z.object({
  videoPath: z.string().min(1).max(500),    // path inside the training-videos bucket
  sport: z.string().max(40).optional(),
  level: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
});

export type VideoEvent = {
  time_seconds: number;
  type: "good" | "warn" | "bad";
  title: string;
  detail: string;
  body_part?: string;
};

export type VideoAnalysis = {
  id: string;
  status: "done" | "error";
  videoUrl: string;
  overallScore: number;
  verdict: string;
  events: VideoEvent[];
  error?: string;
};

const VIDEO_TOOL = {
  type: "function" as const,
  function: {
    name: "submit_video_analysis",
    description:
      "Return precise athletic feedback for the uploaded training video, including timestamped moments where the athlete performed well or made mistakes.",
    parameters: {
      type: "object",
      properties: {
        overall_score: {
          type: "number", minimum: 0, maximum: 10,
          description: "Overall technical score from 0 to 10 (one decimal).",
        },
        verdict: {
          type: "string",
          description: "One short sentence summarising the session (max 90 chars).",
        },
        events: {
          type: "array", minItems: 4, maxItems: 10,
          description:
            "Key moments in the video, ordered by time. Use a mix of 'good' (correct execution), 'warn' (room to improve) and 'bad' (clear mistake). Each event MUST be at a distinct timestamp inside the actual video duration.",
          items: {
            type: "object",
            properties: {
              time_seconds: {
                type: "number", minimum: 0,
                description: "Timestamp in seconds where this moment is visible.",
              },
              type: { type: "string", enum: ["good", "warn", "bad"] },
              title: {
                type: "string",
                description: "Short label (max 60 chars), e.g. 'Hip rotation opens early'.",
              },
              detail: {
                type: "string",
                description:
                  "One concise coaching sentence explaining what happens and why it matters (max 200 chars).",
              },
              body_part: {
                type: "string",
                description: "Main body region involved, e.g. 'right knee', 'hips', 'shoulders'.",
              },
            },
            required: ["time_seconds", "type", "title", "detail"],
          },
        },
      },
      required: ["overall_score", "verdict", "events"],
    },
  },
};

export const analyzeVideo = createServerFn({ method: "POST" })
  .middleware([requireAuthFn])
  .inputValidator((d: unknown) => VideoInputSchema.parse(d))
  .handler(
    async ({ data }): Promise<VideoAnalysis> => {
      const apiKey = process.env.LOVABLE_API_KEY;

      // Build a public URL for the uploaded video so the model can fetch it.
      const { data: pub } = supabaseAdmin.storage
        .from("training-videos")
        .getPublicUrl(data.videoPath);
      const videoUrl = pub.publicUrl;

      // Create the analysis row right away so we can return its id and let
      // the UI poll / display while the model runs.
      const { data: row, error: insertErr } = await supabaseAdmin
        .from("analyses")
        .insert({
          video_path: data.videoPath,
          video_url: videoUrl,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertErr || !row) {
        console.error("analyses insert:", insertErr);
        return {
          id: "",
          status: "error",
          videoUrl,
          overallScore: 0,
          verdict: "",
          events: [],
          error: "Could not start the analysis.",
        };
      }

      if (!apiKey) {
        await supabaseAdmin
          .from("analyses")
          .update({ status: "error", error: "AI service is not configured." })
          .eq("id", row.id);
        return {
          id: row.id,
          status: "error",
          videoUrl,
          overallScore: 0,
          verdict: "",
          events: [],
          error: "AI service is not configured.",
        };
      }

      const sport = data.sport ?? "general athletics";
      const level = data.level ?? "intermediate";

      const system = `You are CourtMind Elite — a calm, precise, world-class sports performance coach.
You are reviewing a real training video of an athlete practising ${sport} (level: ${level}).

Your job:
1. Watch the video carefully.
2. Identify 4 to 8 KEY MOMENTS that are visually decisive — points where the athlete clearly does something well, something to refine, or something wrong.
3. For each moment, pick a SPECIFIC TIMESTAMP IN SECONDS that occurs INSIDE the video (do not invent times beyond its duration).
4. Write feedback that is concrete, technical and actionable. Reference the body part involved.
5. Mix the categories: at least one 'good', one 'warn', one 'bad' if the footage allows.
6. Be honest. If the form is great overall, give a high score; if it is poor, score low.

Use the submit_video_analysis tool to return your answer. Do not write any other text.`;

      const userText =
        (data.notes && data.notes.trim().length > 0
          ? `Athlete note: "${data.notes.trim()}".\n\n`
          : "") +
        "Analyse the attached training video and return the structured feedback.";

      try {
        const res = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              // Pro handles video best in the Gemini family.
              model: "google/gemini-2.5-pro",
              messages: [
                { role: "system", content: system },
                {
                  role: "user",
                  content: [
                    { type: "text", text: userText },
                    // Gemini accepts video via file_url / image_url with a public URL.
                    { type: "image_url", image_url: { url: videoUrl } },
                  ],
                },
              ],
              tools: [VIDEO_TOOL],
              tool_choice: {
                type: "function",
                function: { name: "submit_video_analysis" },
              },
            }),
          },
        );

        if (!res.ok) {
          const txt = await res.text();
          console.error("AI gateway video:", res.status, txt);
          const msg =
            res.status === 429
              ? "Too many requests. Please try again in a moment."
              : res.status === 402
                ? "AI credits required. Add credits in workspace settings."
                : "The AI could not analyse this video. Please try a shorter clip.";
          await supabaseAdmin
            .from("analyses")
            .update({ status: "error", error: msg })
            .eq("id", row.id);
          return {
            id: row.id,
            status: "error",
            videoUrl,
            overallScore: 0,
            verdict: "",
            events: [],
            error: msg,
          };
        }

        const json = await res.json();
        const call = json.choices?.[0]?.message?.tool_calls?.[0];
        if (!call?.function?.arguments) {
          await supabaseAdmin
            .from("analyses")
            .update({ status: "error", error: "No analysis returned." })
            .eq("id", row.id);
          return {
            id: row.id,
            status: "error",
            videoUrl,
            overallScore: 0,
            verdict: "",
            events: [],
            error: "No analysis returned.",
          };
        }

        const parsed = JSON.parse(call.function.arguments) as {
          overall_score: number;
          verdict: string;
          events: VideoEvent[];
        };

        // Sort events chronologically and clamp.
        const events = (parsed.events ?? [])
          .filter((e) => Number.isFinite(e.time_seconds) && e.time_seconds >= 0)
          .map((e) => ({
            ...e,
            time_seconds: Math.max(0, Number(e.time_seconds)),
          }))
          .sort((a, b) => a.time_seconds - b.time_seconds);

        const overallScore = Math.max(
          0,
          Math.min(10, Number(parsed.overall_score) || 0),
        );
        const verdict = String(parsed.verdict || "").slice(0, 140);

        await supabaseAdmin
          .from("analyses")
          .update({
            status: "done",
            overall_score: overallScore,
            verdict,
            events,
            raw: parsed,
          })
          .eq("id", row.id);

        return {
          id: row.id,
          status: "done",
          videoUrl,
          overallScore,
          verdict,
          events,
        };
      } catch (e) {
        console.error("analyzeVideo error:", e);
        await supabaseAdmin
          .from("analyses")
          .update({ status: "error", error: "Unexpected error during analysis." })
          .eq("id", row.id);
        return {
          id: row.id,
          status: "error",
          videoUrl,
          overallScore: 0,
          verdict: "",
          events: [],
          error: "Unexpected error during analysis.",
        };
      }
    },
  );

/* ============================================================
 * FRAME-BASED ANALYSIS — multimodal Gemini with extracted frames
 * Includes content moderation and is robust for any video size
 * (frames are extracted client-side, only ~6 small images sent).
 * ============================================================ */

const FrameInputSchema = z.object({
  frames: z
    .array(z.string().startsWith("data:image/"))
    .min(1)
    .max(8),
  durationSeconds: z.number().min(0).max(36_000).optional(),
  sport: z.string().max(60).optional(),
  level: z.string().max(40).optional(),
  notes: z.string().max(800).optional(),
  language: z.enum(["pt", "en", "es", "fr"]).optional().default("pt"),
});

export type FrameAnalysis = {
  status: "done" | "error" | "blocked";
  id?: string;
  overallScore: number;
  verdict: string;
  events: VideoEvent[];
  positives: string[];
  mistakes: string[];
  improvements: string[];
  steps: string[];
  error?: string;
};

const FRAME_TOOL = {
  type: "function" as const,
  function: {
    name: "submit_frame_analysis",
    description:
      "Return precise, sport-specific feedback after watching the sequence of frames extracted from the athlete's training video.",
    parameters: {
      type: "object",
      properties: {
        safe: {
          type: "boolean",
          description:
            "False if the footage shows nudity, sexual content, graphic violence, self-harm or other unsafe material. True if it is a normal training scene.",
        },
        unsafe_reason: { type: "string" },
        overall_score: { type: "number", minimum: 0, maximum: 10 },
        verdict: { type: "string" },
        positives: {
          type: "array",
          minItems: 2,
          maxItems: 5,
          items: { type: "string" },
        },
        mistakes: {
          type: "array",
          minItems: 1,
          maxItems: 5,
          items: { type: "string" },
        },
        improvements: {
          type: "array",
          minItems: 2,
          maxItems: 5,
          items: { type: "string" },
        },
        steps: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: { type: "string" },
          description: "Step-by-step actions the athlete should take this week to improve.",
        },
        events: {
          type: "array",
          minItems: 3,
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              time_seconds: { type: "number", minimum: 0 },
              type: { type: "string", enum: ["good", "warn", "bad"] },
              title: { type: "string" },
              detail: { type: "string" },
              body_part: { type: "string" },
            },
            required: ["time_seconds", "type", "title", "detail"],
          },
        },
      },
      required: [
        "safe",
        "overall_score",
        "verdict",
        "positives",
        "mistakes",
        "improvements",
        "steps",
        "events",
      ],
    },
  },
};

function langInstruction(lang: string) {
  switch (lang) {
    case "en": return "Respond in English.";
    case "es": return "Responde en español.";
    case "fr": return "Réponds en français.";
    default:   return "Responda em português do Brasil.";
  }
}

export const analyzeFromFrames = createServerFn({ method: "POST" })
  .middleware([requireAuthFn])
  .inputValidator((d: unknown) => FrameInputSchema.parse(d))
  .handler(async ({ data }): Promise<FrameAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        status: "error",
        overallScore: 0,
        verdict: "",
        events: [],
        positives: [],
        mistakes: [],
        improvements: [],
        steps: [],
        error: "AI service is not configured.",
      };
    }

    const sport = data.sport ?? "general athletics";
    const level = data.level ?? "intermediate";
    const dur = data.durationSeconds ?? 0;

    const system = `You are CourtMind Elite — a calm, precise, world-class sports performance coach.
You receive a SEQUENCE of frames evenly sampled from a real training video of an athlete practising ${sport} (level: ${level}).
The total video duration is ~${dur.toFixed(1)}s. Frame i corresponds roughly to time = i/(N-1) * duration.

Your job:
1. FIRST, check content safety. If the frames show nudity, sexual content, graphic violence, self-harm, or anything clearly inappropriate, set safe=false and give a short reason — do NOT analyse further.
2. Otherwise, analyse the athletic execution carefully and SPECIFICALLY for ${sport}.
3. Identify what the athlete is doing well (positives), what is wrong (mistakes), and HOW to improve (steps).
4. Build 3-8 timestamped events anchored to the actual visible moments. Use a mix of good / warn / bad.
5. Be concrete, technical, kind. Reference body parts.

${langInstruction(data.language)}
Return ONLY via the submit_frame_analysis tool.`;

    const userText =
      (data.notes && data.notes.trim().length > 0
        ? `Athlete note: "${data.notes.trim()}".\n\n`
        : "") +
      `Here are ${data.frames.length} frames in chronological order. Analyse them and return structured feedback.`;

    const content: any[] = [{ type: "text", text: userText }];
    for (const f of data.frames) {
      content.push({ type: "image_url", image_url: { url: f } });
    }

    try {
      const res = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: system },
              { role: "user", content },
            ],
            tools: [FRAME_TOOL],
            tool_choice: {
              type: "function",
              function: { name: "submit_frame_analysis" },
            },
          }),
        },
      );

      if (!res.ok) {
        const txt = await res.text();
        console.error("frames AI gateway:", res.status, txt);
        const msg =
          res.status === 429
            ? "Muitas requisições. Tente de novo em instantes."
            : res.status === 402
              ? "Créditos de IA esgotados. Adicione créditos no workspace."
              : "A IA não conseguiu analisar este vídeo. Tente um clipe mais curto.";
        return {
          status: "error",
          overallScore: 0,
          verdict: "",
          events: [],
          positives: [],
          mistakes: [],
          improvements: [],
          steps: [],
          error: msg,
        };
      }

      const json = await res.json();
      const call = json.choices?.[0]?.message?.tool_calls?.[0];
      if (!call?.function?.arguments) {
        return {
          status: "error",
          overallScore: 0,
          verdict: "",
          events: [],
          positives: [],
          mistakes: [],
          improvements: [],
          steps: [],
          error: "Nenhuma análise retornada.",
        };
      }

      const parsed = JSON.parse(call.function.arguments);

      if (parsed.safe === false) {
        return {
          status: "blocked",
          overallScore: 0,
          verdict: "",
          events: [],
          positives: [],
          mistakes: [],
          improvements: [],
          steps: [],
          error:
            parsed.unsafe_reason ||
            "Conteúdo bloqueado pela moderação. Envie um vídeo de treino apropriado.",
        };
      }

      const events = (parsed.events ?? [])
        .filter((e: any) => Number.isFinite(e.time_seconds) && e.time_seconds >= 0)
        .map((e: any) => ({
          time_seconds: Math.max(0, Number(e.time_seconds)),
          type: e.type,
          title: String(e.title || "").slice(0, 80),
          detail: String(e.detail || "").slice(0, 240),
          body_part: e.body_part ? String(e.body_part).slice(0, 40) : undefined,
        }))
        .sort((a: any, b: any) => a.time_seconds - b.time_seconds);

      // Persist to DB so /history & /profile work.
      let id: string | undefined;
      try {
        const { data: row } = await supabaseAdmin
          .from("analyses")
          .insert({
            video_path: "frames-only",
            video_url: "",
            status: "done",
            overall_score: Number(parsed.overall_score) || 0,
            verdict: String(parsed.verdict || "").slice(0, 200),
            events,
            raw: parsed,
          })
          .select("id")
          .single();
        id = row?.id;
      } catch (e) {
        console.warn("could not persist frames analysis:", e);
      }

      return {
        status: "done",
        id,
        overallScore: Math.max(0, Math.min(10, Number(parsed.overall_score) || 0)),
        verdict: String(parsed.verdict || "").slice(0, 200),
        events,
        positives: (parsed.positives ?? []).map((s: any) => String(s)),
        mistakes: (parsed.mistakes ?? []).map((s: any) => String(s)),
        improvements: (parsed.improvements ?? []).map((s: any) => String(s)),
        steps: (parsed.steps ?? []).map((s: any) => String(s)),
      };
    } catch (e) {
      console.error("analyzeFromFrames error:", e);
      return {
        status: "error",
        overallScore: 0,
        verdict: "",
        events: [],
        positives: [],
        mistakes: [],
        improvements: [],
        steps: [],
        error: "Erro inesperado durante a análise.",
      };
    }
  });

/* ============================================================
 * TEXT WORKOUT ANALYSIS
 * ============================================================ */

const TextInputSchema = z.object({
  description: z.string().min(10).max(4000),
  sport: z.string().max(60).optional(),
  level: z.string().max(40).optional(),
  language: z.enum(["pt", "en", "es", "fr"]).optional().default("pt"),
});

export type TextWorkoutAnalysis = {
  status: "done" | "error" | "blocked";
  overallScore: number;
  verdict: string;
  positives: string[];
  mistakes: string[];
  improvements: string[];
  steps: string[];
  error?: string;
};

const TEXT_TOOL = {
  type: "function" as const,
  function: {
    name: "submit_text_analysis",
    description: "Return structured feedback for a written training session description.",
    parameters: {
      type: "object",
      properties: {
        safe: { type: "boolean" },
        unsafe_reason: { type: "string" },
        overall_score: { type: "number", minimum: 0, maximum: 10 },
        verdict: { type: "string" },
        positives: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
        mistakes: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } },
        improvements: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
        steps: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
      },
      required: ["safe", "overall_score", "verdict", "positives", "mistakes", "improvements", "steps"],
    },
  },
};

export const analyzeWorkoutText = createServerFn({ method: "POST" })
  .middleware([requireAuthFn])
  .inputValidator((d: unknown) => TextInputSchema.parse(d))
  .handler(async ({ data }): Promise<TextWorkoutAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        status: "error",
        overallScore: 0,
        verdict: "",
        positives: [],
        mistakes: [],
        improvements: [],
        steps: [],
        error: "AI service is not configured.",
      };
    }

    const sport = data.sport ?? "general athletics";
    const level = data.level ?? "intermediate";

    const system = `You are CourtMind Elite — a precise sports performance coach.
The athlete (${sport}, ${level}) describes a training session in plain words.
1. Block clearly inappropriate or harmful descriptions (set safe=false).
2. Otherwise, evaluate technique, volume, intensity. Give positives, mistakes, concrete improvements and step-by-step next actions.
${langInstruction(data.language)}
Return only via the submit_text_analysis tool.`;

    try {
      const res = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: system },
              { role: "user", content: data.description },
            ],
            tools: [TEXT_TOOL],
            tool_choice: { type: "function", function: { name: "submit_text_analysis" } },
          }),
        },
      );

      if (!res.ok) {
        const msg =
          res.status === 429
            ? "Muitas requisições. Tente de novo em instantes."
            : res.status === 402
              ? "Créditos de IA esgotados."
              : "A IA não conseguiu analisar este texto.";
        return {
          status: "error",
          overallScore: 0,
          verdict: "",
          positives: [],
          mistakes: [],
          improvements: [],
          steps: [],
          error: msg,
        };
      }

      const json = await res.json();
      const call = json.choices?.[0]?.message?.tool_calls?.[0];
      if (!call?.function?.arguments) {
        return {
          status: "error",
          overallScore: 0,
          verdict: "",
          positives: [],
          mistakes: [],
          improvements: [],
          steps: [],
          error: "Nenhuma análise retornada.",
        };
      }

      const parsed = JSON.parse(call.function.arguments);
      if (parsed.safe === false) {
        return {
          status: "blocked",
          overallScore: 0,
          verdict: "",
          positives: [],
          mistakes: [],
          improvements: [],
          steps: [],
          error:
            parsed.unsafe_reason ||
            "Conteúdo bloqueado pela moderação.",
        };
      }

      return {
        status: "done",
        overallScore: Math.max(0, Math.min(10, Number(parsed.overall_score) || 0)),
        verdict: String(parsed.verdict || "").slice(0, 200),
        positives: (parsed.positives ?? []).map((s: any) => String(s)),
        mistakes: (parsed.mistakes ?? []).map((s: any) => String(s)),
        improvements: (parsed.improvements ?? []).map((s: any) => String(s)),
        steps: (parsed.steps ?? []).map((s: any) => String(s)),
      };
    } catch (e) {
      console.error("analyzeWorkoutText error:", e);
      return {
        status: "error",
        overallScore: 0,
        verdict: "",
        positives: [],
        mistakes: [],
        improvements: [],
        steps: [],
        error: "Erro inesperado durante a análise.",
      };
    }
  });
