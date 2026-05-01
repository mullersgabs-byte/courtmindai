import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  sport: z.string().min(1).max(60),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(2).max(7),
  focus: z.string().max(200).optional().default(""),
  sessionMinutes: z.number().int().min(15).max(180).default(60),
});

export type GeneratePlanInput = z.infer<typeof InputSchema>;

export type Exercise = {
  name: string;
  sets?: string;
  duration?: string;
  instructions: string;
  focus: string;
};

export type DayPlan = {
  day: string;
  title: string;
  type: "training" | "recovery" | "rest";
  durationMinutes: number;
  intensity: "Low" | "Medium" | "High";
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
  coachNote: string;
};

export type WeeklyPlan = {
  sport: string;
  level: string;
  weeklyGoal: string;
  overview: string;
  days: DayPlan[];
};

const planTool = {
  type: "function" as const,
  function: {
    name: "return_weekly_plan",
    description: "Return a structured weekly training plan tailored to the athlete's sport.",
    parameters: {
      type: "object",
      properties: {
        sport: { type: "string" },
        level: { type: "string" },
        weeklyGoal: { type: "string", description: "Short headline goal for this week (max 90 chars)." },
        overview: { type: "string", description: "1–2 sentence overview of the week's intent." },
        days: {
          type: "array",
          minItems: 7,
          maxItems: 7,
          items: {
            type: "object",
            properties: {
              day: { type: "string", description: "Mon, Tue, Wed, Thu, Fri, Sat, Sun" },
              title: { type: "string", description: "Short session title." },
              type: { type: "string", enum: ["training", "recovery", "rest"] },
              durationMinutes: { type: "number" },
              intensity: { type: "string", enum: ["Low", "Medium", "High"] },
              warmup: { type: "string", description: "1–2 sentence warm-up." },
              exercises: {
                type: "array",
                minItems: 0,
                maxItems: 8,
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    sets: { type: "string", description: "e.g. '4 × 8' or empty if duration-based" },
                    duration: { type: "string", description: "e.g. '15 min' or empty if set-based" },
                    instructions: { type: "string", description: "How to perform it, sport-specific cues." },
                    focus: { type: "string", description: "What it trains (e.g. 'Footwork', 'Power')." },
                  },
                  required: ["name", "instructions", "focus"],
                  additionalProperties: false,
                },
              },
              cooldown: { type: "string" },
              coachNote: { type: "string", description: "Brief tip for the day." },
            },
            required: ["day", "title", "type", "durationMinutes", "intensity", "warmup", "exercises", "cooldown", "coachNote"],
            additionalProperties: false,
          },
        },
      },
      required: ["sport", "level", "weeklyGoal", "overview", "days"],
      additionalProperties: false,
    },
  },
};

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ plan: WeeklyPlan | null; error: string | null }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { plan: null, error: "AI service is not configured." };
    }

    const systemPrompt = `You are an elite performance coach. Compose precise, sport-specific weekly training plans for athletes.
- Be concrete: name real exercises, drills, and sets/reps relevant to the sport.
- Adapt to the athlete's level (${data.level}).
- Respect the requested ${data.daysPerWeek} training days per week — fill the rest with active recovery or rest.
- Each training session should target around ${data.sessionMinutes} minutes total.
- Keep instructions short, actionable, and athletic in tone.
- Always return exactly 7 days starting Mon → Sun.`;

    const userPrompt = `Sport: ${data.sport}
Level: ${data.level}
Days per week: ${data.daysPerWeek}
Session length: ${data.sessionMinutes} min
Focus / goal: ${data.focus || "balanced general progression"}

Compose this week's plan.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [planTool],
          tool_choice: { type: "function", function: { name: "return_weekly_plan" } },
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          return { plan: null, error: "Rate limit reached. Please try again in a moment." };
        }
        if (res.status === 402) {
          return { plan: null, error: "AI credits exhausted. Add funds to your Lovable AI workspace." };
        }
        const text = await res.text();
        console.error("AI gateway error:", res.status, text);
        return { plan: null, error: `AI gateway error (${res.status}).` };
      }

      const json = await res.json();
      const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
      const argsRaw = toolCall?.function?.arguments;
      if (!argsRaw) {
        console.error("No tool call returned:", JSON.stringify(json).slice(0, 500));
        return { plan: null, error: "AI did not return a structured plan." };
      }

      const parsed = JSON.parse(argsRaw) as WeeklyPlan;
      return { plan: parsed, error: null };
    } catch (e) {
      console.error("generatePlan failed:", e);
      return { plan: null, error: "Plan generation failed unexpectedly." };
    }
  });