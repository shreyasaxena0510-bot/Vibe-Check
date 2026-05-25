const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function buildPrompt(idea) {
  return `You are a brutally honest Gen Z startup critic with deep knowledge of the startup ecosystem. Analyze this startup idea and respond ONLY with a valid JSON object. No markdown, no backticks, no explanation, just raw JSON.

Startup idea: "${idea}"

Respond with exactly this structure:
{
  "vibeScore": <integer 0-100>,
  "vibeRating": <one of exactly: "no cap slaps", "lowkey potential", "mid at best", "not it chief", "absolutely cooked">,
  "vibeHeadline": <a punchy 4-6 word verdict, Gen Z energy, no punctuation>,
  "verdictSub": <1-2 sentences honest take, conversational, mention the core issue or opportunity>,
  "roast": <2-3 sentences: acknowledge what's genuinely interesting, then call out the real problem, end with one specific thing they should actually focus on. Be funny but constructive.>,
  "existingCompetitors": <array of 3-4 real companies/products this already resembles, be specific>,
  "differentiators": <array of 2-3 specific ways this could actually be different if executed right>,
  "risks": <array of 2-3 specific real risks, be concrete not generic>,
  "marketTiming": <one of: "too early", "perfect timing", "slightly late", "way too late">,
  "buildDifficulty": <one of: "weekend project", "3-month mvp", "hard", "requires phd">,
  "monetization": <one of: "obvious", "tricky", "unclear", "probably ads lol">,
  "genZWouldUse": <one of: "absolutely", "maybe", "probably not", "no chance">
}`;
}

function parseJsonResponse(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY is not set' });
  }

  const { idea } = req.body || {};
  if (!idea || typeof idea !== 'string' || !idea.trim()) {
    return res.status(400).json({ error: 'Startup idea is required' });
  }

  const trimmedIdea = idea.trim().slice(0, 500);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(trimmedIdea) }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      const message = geminiData?.error?.message || 'Gemini API request failed';
      return res.status(geminiRes.status).json({ error: message });
    }

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(502).json({ error: 'Empty response from Gemini' });
    }

    const result = parseJsonResponse(rawText);
    return res.status(200).json(result);
  } catch (err) {
    console.error('vibe-check error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze startup idea' });
  }
}
