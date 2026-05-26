import { AssignmentDoc } from '../models/Assignment';

const TYPE_LABEL: Record<string, string> = {
  mcq: 'Multiple Choice Questions',
  short: 'Short Answer Questions',
  long: 'Long Answer Questions',
  diagram: 'Diagram / Graph Based Questions',
  numerical: 'Numerical Problems',
};

export const SYSTEM_PROMPT = `You are an experienced CBSE / ICSE exam-paper author for grades 1-12. You write question papers that are:
- Pedagogically sound: difficulty distribution roughly 40% easy, 40% moderate, 20% hard unless the user requests otherwise.
- Curriculum-aligned: questions are appropriate for the subject and class.
- Well-structured: grouped into clearly labelled sections (Section A, Section B, ...) with a short instruction line.
- Self-contained: each question is fully stated, no missing context.
- Realistic: questions look like ones a real teacher would set, not generic textbook clones.

Always call the generate_question_paper tool with the structured paper. Do not include prose, markdown, or commentary outside the tool call.

Difficulty values must be exactly one of: easy, moderate, hard.
Question IDs are short tokens like Q1, Q2 (unique across the whole paper).
Sections must be lettered (A, B, C, ...) in order.
Group questions by type into separate sections (e.g. Section A = MCQs, Section B = Short Answers).
Each section's "instruction" line should reflect the marks per question, e.g. "Attempt all questions. Each question carries 2 marks."
Generate an answerKey with concise model answers for every question.`;

export function buildUserPrompt(assignment: AssignmentDoc, schoolName: string): string {
  const totals = assignment.questionTypes.reduce(
    (acc, q) => ({ q: acc.q + q.count, m: acc.m + q.count * q.marks }),
    { q: 0, m: 0 }
  );

  const breakdown = assignment.questionTypes
    .map(
      (q, i) =>
        `${i + 1}. ${TYPE_LABEL[q.type] || q.type}: ${q.count} questions × ${q.marks} mark${q.marks === 1 ? '' : 's'} each`
    )
    .join('\n');

  const due = assignment.dueDate.toISOString().slice(0, 10);

  return `Create a question paper with the following specification:

School: ${schoolName}
Assignment Title (use this to infer subject + class): "${assignment.title}"
Due date: ${due}

Total questions: ${totals.q}
Total marks: ${totals.m}

Question composition:
${breakdown}

Additional instructions from the teacher:
${assignment.additionalInstructions?.trim() || '(none)'}

Produce exactly the requested counts per question type. Group each type into its own lettered section.`;
}

export const PAPER_TOOL = {
  name: 'generate_question_paper',
  description:
    'Submit the fully-structured generated question paper. Must include meta, sections (one per question type), and an answer key.',
  input_schema: {
    type: 'object' as const,
    properties: {
      meta: {
        type: 'object',
        properties: {
          schoolName: { type: 'string' },
          subject: { type: 'string' },
          className: { type: 'string', description: 'e.g. "5th", "Grade 8"' },
          timeAllowed: { type: 'string', description: 'e.g. "45 minutes"' },
          maxMarks: { type: 'integer' },
          generalInstructions: {
            type: 'string',
            description: 'One short paragraph of general instructions to students.',
          },
        },
        required: ['schoolName', 'subject', 'className', 'timeAllowed', 'maxMarks', 'generalInstructions'],
      },
      sections: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Single uppercase letter: A, B, C, ...' },
            title: { type: 'string', description: 'e.g. "Short Answer Questions"' },
            instruction: { type: 'string', description: 'e.g. "Attempt all questions. Each carries 2 marks."' },
            questions: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Unique across the paper, like Q1, Q2.' },
                  text: { type: 'string' },
                  difficulty: { type: 'string', enum: ['easy', 'moderate', 'hard'] },
                  marks: { type: 'integer', minimum: 1 },
                },
                required: ['id', 'text', 'difficulty', 'marks'],
              },
            },
          },
          required: ['id', 'title', 'instruction', 'questions'],
        },
      },
      answerKey: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            questionId: { type: 'string' },
            answer: { type: 'string' },
          },
          required: ['questionId', 'answer'],
        },
      },
    },
    required: ['meta', 'sections'],
  },
};
