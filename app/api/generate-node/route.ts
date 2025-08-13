import { OpenAI } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const authHeader = req.headers.get('Authorization')
  const apiKey = authHeader?.split(' ')[1] || process.env.OPENAI_KEY!

  const openai = new OpenAI({
    apiKey: apiKey
  })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      stream: true,
      messages: [{
        role: 'system',
        content: `You generate React Flow nodes in JSON format. Include:
        - id (unique string)
        - type (node type)
        - position {x,y}
        - data {label, functionality}`
      }, {
        role: 'user',
        content: prompt
      }]
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
