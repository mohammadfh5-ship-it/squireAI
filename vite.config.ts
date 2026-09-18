import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw) as unknown
}

function llmIntentPlugin(): Plugin {
  return {
    name: 'squire-llm-intent',
    configureServer(server) {
      server.middlewares.use('/api/intent', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }
        void handleIntentRequest(req, res)
      })
    },
  }
}

async function handleIntentRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const key = process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY
  if (!key) {
    res.statusCode = 204
    res.end()
    return
  }

  try {
    const body = (await readJsonBody(req)) as { text?: string }
    const text = (body.text ?? '').slice(0, 500)
    const model = process.env.LLM_MODEL ?? 'gpt-4o-mini'
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Extract intent for SquireAI local-deals companion. Return JSON only with keys: vertical (auto|style|night|null), zip (5-digit or null), styleKind (cut|blowout|nails|any), nightKind (movie|comedy|live|subscription|any), autoKind (any|synthetic|new_customer|locked), timing (tonight|weekend|tuesday|wednesday|anytime), student (boolean), military (boolean). Keyword fallback already exists; do not invent prices or merchants.',
          },
          { role: 'user', content: text },
        ],
      }),
    })

    if (!upstream.ok) {
      res.statusCode = 204
      res.end()
      return
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content ?? '{}'
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(content)
  } catch {
    res.statusCode = 204
    res.end()
  }
}

export default defineConfig({
  plugins: [react(), llmIntentPlugin()],
})
