import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(request: Request) {
  const { contentType, pillar, topic, context, brandVoice, hashtags, model } = await request.json();

  const system = [
    'You are an expert content creator for a digital AI agency.',
    brandVoice ? `Brand voice: ${brandVoice}` : '',
    pillar ? `Content pillar: ${pillar}` : '',
  ].filter(Boolean).join('\n');

  const prompt = [
    `Create a ${contentType} about: ${topic}`,
    context ? `Additional context: ${context}` : '',
    hashtags ? `Include these hashtags where appropriate: ${hashtags}` : '',
    'Write in first person, be specific and actionable, avoid generic filler.',
  ].filter(Boolean).join('\n\n');

  const result = streamText({
    model: anthropic(model ?? 'claude-sonnet-4.6'),
    system,
    prompt,
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
