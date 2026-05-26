import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  marks: z.number().int().min(1).max(50),
});

export const SectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

export const AnswerKeyEntrySchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

export const PaperMetaSchema = z.object({
  schoolName: z.string().min(1),
  subject: z.string().min(1),
  className: z.string().min(1),
  timeAllowed: z.string().min(1),
  maxMarks: z.number().int().min(1),
  generalInstructions: z.string().min(1),
});

export const PaperSchema = z.object({
  meta: PaperMetaSchema,
  sections: z.array(SectionSchema).min(1),
  answerKey: z.array(AnswerKeyEntrySchema).optional(),
});

export type ValidatedPaper = z.infer<typeof PaperSchema>;
