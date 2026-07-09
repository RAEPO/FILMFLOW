// api/chat.js — Anthropic Claude API 프록시

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST만 허용됩니다" });
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다" });
    }
  
    const body = req.body || {};
  
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.model || "claude-sonnet-4-5",
          max_tokens: Math.min(body.max_tokens || 800, 2000),
          system: body.system || "",
          messages: body.messages || [],
        }),
      });
  
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: "AI 호출 실패: " + e.message });
    }
  }