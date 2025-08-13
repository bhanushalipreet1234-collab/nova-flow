import { OpenAI } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY!
})

export async function POST(req: Request) {
  const { prompt } = await req.json()
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages: [{
      role: 'system',
      content: `You generate React Flow nodes in JSON format with: id, type, position, data`
    }, {
      role: 'user',
      content: prompt
    }]
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
