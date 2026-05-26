import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { SYSTEM_PROMPT, PAPER_TOOL } from './prompt';
import { PaperSchema, ValidatedPaper } from './schema';

// Sonnet 4.6 — current Sonnet generation per the runtime context (model ids: claude-sonnet-4-6).
export const CLAUDE_MODEL = 'claude-sonnet-4-6';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function generatePaper(userPrompt: string): Promise<ValidatedPaper> {
  const anthropic = getClient();

  // First attempt
  let attempt = 0;
  let lastError = '';
  while (attempt < 2) {
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: 'user',
        content: attempt === 0
          ? userPrompt
          : `${userPrompt}\n\nYour previous output failed validation with: ${lastError}\nReturn corrected JSON via the tool call.`,
      },
    ];

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // Prompt caching on the stable system prefix. Cast: cache_control
          // is supported at runtime but missing from this SDK version's TextBlockParam.
          cache_control: { type: 'ephemeral' },
        } as any,
      ],
      tools: [PAPER_TOOL as any],
      tool_choice: { type: 'tool', name: 'generate_question_paper' },
      messages,
    });

    const toolBlock = response.content.find(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use'
    );
    if (!toolBlock) {
      lastError = 'no tool_use block in response';
      attempt++;
      continue;
    }

    const parsed = PaperSchema.safeParse(toolBlock.input);
    if (parsed.success) {
      return parsed.data;
    }
    lastError = JSON.stringify(parsed.error.flatten());
    attempt++;
  }
  throw new Error(`Claude output failed validation after 2 attempts: ${lastError}`);
}
