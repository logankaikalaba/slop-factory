const API_URL = process.env.INTERNAL_API_URL ?? 'http://localhost:4000'

export async function POST(request: Request) {
  const body = await request.json()

  const upstream = await fetch(`${API_URL}/api/adforge/avatars/deep-research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
