import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import type Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { SYSTEM_PROMPT, PAPER_TOOL } from './prompt';
import { PaperSchema, ValidatedPaper } from './schema';

// Bedrock model ID for Claude Sonnet 4.6
export const CLAUDE_MODEL = 'us.anthropic.claude-sonnet-4-6';

let client: AnthropicBedrock | null = null;
function getClient(): AnthropicBedrock {
  if (!client) {
    client = new AnthropicBedrock({
      awsAccessKey: env.AWS_ACCESS_KEY_ID,
      awsSecretKey: env.AWS_SECRET_ACCESS_KEY,
      awsRegion: env.AWS_DEFAULT_REGION,
    });
  }
  return client;
}

export async function generatePaper(userPrompt: string): Promise<ValidatedPaper> {
  const anthropic = getClient();

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
          cache_control: { type: 'ephemeral' },
        } as any,
      ],
      tools: [PAPER_TOOL as any],
      tool_choice: { type: 'tool', name: 'generate_question_paper' },
      messages,
    });

    const toolBlock = response.content.find((b) => b.type === 'tool_use') as
      | Anthropic.Messages.ToolUseBlock
      | undefined;
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
