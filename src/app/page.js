"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: "You are an intelligent hackathon assistant providing structured responses.",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI response");
      }
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
          🚀 God-Mode Boilerplate
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Next.js App Router • Vanilla JS • Vanilla CSS • Prisma (Supabase) • Gemini 2.5 Flash
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Generic AI Route Tester</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                AI Prompt (via <code>/api/ai</code>):
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Tulis prompt atau ide produk hackathon kamu di sini..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Generating with Gemini 2.5 Flash..." : "Test AI Route"}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "var(--border-radius)", backgroundColor: "#7f1d1d", color: "#fecaca" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {response && (
            <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "var(--primary-color)" }}>
                {response.title || "AI Response"}
              </h3>
              <p style={{ marginBottom: "1rem", color: "var(--text-color)" }}>{response.summary}</p>
              
              <div style={{ backgroundColor: "#0b1120", padding: "1rem", borderRadius: "var(--border-radius)", overflowX: "auto" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Raw Structured JSON:</div>
                <pre style={{ margin: 0, fontSize: "0.85rem", color: "#38bdf8" }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>⚡ Quick Reference Commands</h2>
          <ul style={{ paddingLeft: "1.25rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.95rem" }}>
            <li><code>npm run dev</code> : Jalankan Next.js server</li>
            <li><code>npx prisma db push</code> : Sinkronisasi schema ke database Supabase</li>
            <li><code>npx prisma studio</code> : GUI Database Viewer di browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
