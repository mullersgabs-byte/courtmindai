import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { TabBar } from "@/components/TabBar";
import { Upload, Send } from "lucide-react";

export const Route = createFileRoute("/coach")({
  head: () => ({ meta: [{ title: "AI Coach — CourtMind" }] }),
  component: CoachPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function CoachPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [videoName, setVideoName] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "I am your AI Coach. Upload a training video for analysis or ask any question about your training, posture, or performance." },
  ]);

  const onPickVideo = (f: File | null) => {
    if (!f) return;
    setVideoName(f.name);
    setMessages((m) => [
      ...m,
      { role: "user", content: `Uploaded video: ${f.name}` },
      { role: "assistant", content: "Video received. I will review the footage and provide structured feedback shortly." },
    ]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: next }),
        },
      );
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.content || "" }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "I could not reach the coaching service. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-40">
      <main className="mx-auto max-w-[420px] px-5 pt-14">
        <p className="text-[12px] uppercase tracking-[0.18em] text-white/50">AI Coach</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">Personal analysis</h1>

        {/* Video upload */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[14px] font-semibold">Analyze with Video</p>
          <p className="mt-1 text-[12px] text-white/55">Upload your training video for analysis</p>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => onPickVideo(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-5 text-[13px] font-medium text-white/80 transition hover:border-white/40 hover:text-white"
          >
            <Upload size={16} strokeWidth={1.75} />
            {videoName ? videoName : "Choose a video"}
          </button>
        </section>

        {/* Chat */}
        <section className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="px-1 text-[14px] font-semibold">Ask with Text</p>
          <ul className="mt-3 space-y-2">
            {messages.map((m, i) => (
              <li
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-white text-black"
                    : "mr-auto border border-white/10 bg-white/[0.04] text-white/85"
                }`}
              >
                {m.content}
              </li>
            ))}
            {loading && (
              <li className="mr-auto rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/55">
                Thinking…
              </li>
            )}
          </ul>

          <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-[oklch(0.16_0_0)] px-3 py-1.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask about your training, posture, or performance"
              className="flex-1 bg-transparent px-2 py-2 text-[13px] text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black disabled:opacity-40"
            >
              <Send size={15} strokeWidth={1.75} />
            </button>
          </div>
        </section>
      </main>
      <TabBar />
    </div>
  );
}