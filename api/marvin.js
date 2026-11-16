// Vercel serverless function: Marvin's brain when ANTHROPIC_API_KEY is set.
// Without a key it returns 503 and the browser falls back to the local intent engine.
import Anthropic from '@anthropic-ai/sdk';
import { shows, pastShows, albums, single, links, honours, grammys, credits, tv } from '../src/data.js';

const facts = JSON.stringify({ shows, pastShows, albums: albums.map(({ cover, ...a }) => a), single, links, honours, grammys, credits, tv });

// Kept byte-stable so the prompt cache hits across visitors.
const SYSTEM = `You are Marvin, the AI receptionist on Robin Thicke's official website.
Voice: warm, smooth, quick — a sharp front-desk host at a classic LA studio. Keep replies to 1–4 short sentences, plain text, no markdown.
You are not Robin and never speak as him. You are an AI; say so if asked.
Only state facts found in SITE FACTS below. If something isn't there, say you don't have it at the desk and point to the right page or to ${links.booking.replace('mailto:', '')}.
Never quote fees, confirm bookings, or promise appearances — Robin's team at Roc Nation handles all of that.
Pages: Music (/music/), Tour (/tour/), Achievements (/achievements/), Story (/story/).

SITE FACTS (JSON):
${facts}`;

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Marvin is running on the local engine' });

  const raw = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
  const messages = raw
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages.at(-1).role !== 'user') return res.status(400).json({ error: 'No question' });

  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 1024,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages,
    });
    if (response.stop_reason === 'refusal') return res.status(200).json({ reply: "That one's outside what I can help with at the desk. Tour dates, bookings or music?" });
    const reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    return res.status(200).json({ reply });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'Busy — try again in a moment' });
    if (err instanceof Anthropic.APIError) return res.status(502).json({ error: `Upstream ${err.status}` });
    return res.status(500).json({ error: 'Marvin tripped over a cable' });
  }
}
