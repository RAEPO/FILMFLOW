// api/tts.js — ElevenLabs 음성 생성 프록시

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST만 허용됩니다" });
    }
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ELEVENLABS_API_KEY가 설정되지 않았습니다" });
    }
  
    const body = req.body || {};
    const text = String(body.text || "").slice(0, 500); // 크레딧 보호: 최대 500자
    if (!text.trim()) {
      return res.status(400).json({ error: "text가 필요합니다" });
    }
  
    // 목소리: 환경변수 ELEVENLABS_VOICE_ID로 지정 (없으면 기본 목소리)
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  
    try {
      const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // 한국어 지원 모델
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      });
  
      if (!r.ok) {
        const errText = await r.text();
        return res.status(r.status).json({ error: "ElevenLabs 오류: " + errText.slice(0, 300) });
      }
  
      const audioBuffer = Buffer.from(await r.arrayBuffer());
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(audioBuffer);
    } catch (e) {
      return res.status(500).json({ error: "음성 생성 실패: " + e.message });
    }
  }