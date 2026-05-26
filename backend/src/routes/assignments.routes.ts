import { Router, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { AssignmentModel } from '../models/Assignment';
import { QuestionPaperModel } from '../models/QuestionPaper';
import { generationQueue } from '../queues/generation.queue';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache';

const router = Router();

const QuestionTypeSpec = z.object({
  type: z.enum(['mcq', 'short', 'long', 'diagram', 'numerical']),
  count: z.number().int().min(1).max(50),
  marks: z.number().int().min(1).max(50),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(120),
  dueDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date'),
  questionTypes: z.array(QuestionTypeSpec).min(1).max(8),
  additionalInstructions: z.string().max(2000).optional().default(''),
  fileMeta: z
    .object({ name: z.string(), sizeBytes: z.number().int().nonnegative(), mimeType: z.string() })
    .optional(),
});

router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res: Response) => {
  const list = await AssignmentModel.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(list.map(serializeAssignment));
});

router.post('/', async (req: AuthedRequest, res: Response) => {
  const parsed = CreateAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;

  const due = new Date(data.dueDate);
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (due < tomorrow) {
    res.status(400).json({ error: 'Due date must be at least tomorrow' });
    return;
  }

  const totalQuestions = data.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = data.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);
  if (totalQuestions > 100 || totalMarks > 500) {
    res.status(400).json({ error: 'Question or marks total exceeds limit (100 questions / 500 marks)' });
    return;
  }

  const distinct = new Set(data.questionTypes.map((q) => q.type));
  if (distinct.size !== data.questionTypes.length) {
    res.status(400).json({ error: 'Question types must be distinct' });
    return;
  }

  const assignment = await AssignmentModel.create({
    userId: new Types.ObjectId(req.userId),
    title: data.title,
    dueDate: due,
    questionTypes: data.questionTypes,
    additionalInstructions: data.additionalInstructions,
    fileMeta: data.fileMeta,
    status: 'queued',
  });

  const job = await generationQueue.add(
    'generate',
    { assignmentId: String(assignment._id) },
    { attempts: 2, removeOnComplete: 100, removeOnFail: 100 }
  );
  assignment.jobId = String(job.id);
  await assignment.save();

  res.status(201).json(serializeAssignment(assignment.toObject()));
});

router.get('/:id', async (req: AuthedRequest, res: Response) => {
  const a = await findOwn(req);
  if (!a) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(serializeAssignment(a));
});

router.delete('/:id', async (req: AuthedRequest, res: Response) => {
  const a = await findOwn(req);
  if (!a) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  if (a.paperId) {
    await QuestionPaperModel.deleteOne({ _id: a.paperId });
    await cacheDel(`paper:${a.paperId}`);
  }
  await AssignmentModel.deleteOne({ _id: a._id });
  res.json({ ok: true });
});

router.get('/:id/paper', async (req: AuthedRequest, res: Response) => {
  const a = await findOwn(req);
  if (!a) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  if (!a.paperId) {
    res.status(409).json({ error: 'Paper not ready', status: a.status });
    return;
  }
  const cacheKey = `paper:${String(a.paperId)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    res.json({ ...(cached as object), assignment: serializeAssignment(a), cached: true });
    return;
  }
  const paper = await QuestionPaperModel.findById(a.paperId).lean();
  if (!paper) {
    res.status(404).json({ error: 'Paper not found' });
    return;
  }
  const payload = serializePaper(paper);
  await cacheSet(cacheKey, payload, 3600);
  res.json({ ...payload, assignment: serializeAssignment(a), cached: false });
});

router.post('/:id/regenerate', async (req: AuthedRequest, res: Response) => {
  const a = await findOwn(req);
  if (!a) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  if (a.paperId) {
    await QuestionPaperModel.deleteOne({ _id: a.paperId });
    await cacheDel(`paper:${a.paperId}`);
  }
  a.status = 'queued';
  a.paperId = undefined;
  a.errorMessage = undefined;
  await a.save();
  const job = await generationQueue.add(
    'generate',
    { assignmentId: String(a._id) },
    { attempts: 2, removeOnComplete: 100, removeOnFail: 100 }
  );
  a.jobId = String(job.id);
  await a.save();
  res.json(serializeAssignment(a.toObject()));
});

async function findOwn(req: AuthedRequest) {
  if (!Types.ObjectId.isValid(req.params.id)) return null;
  return AssignmentModel.findOne({ _id: req.params.id, userId: req.userId });
}

function serializeAssignment(a: any) {
  return {
    _id: String(a._id),
    userId: String(a.userId),
    title: a.title,
    fileMeta: a.fileMeta,
    dueDate: a.dueDate?.toISOString?.() || a.dueDate,
    questionTypes: a.questionTypes,
    additionalInstructions: a.additionalInstructions,
    status: a.status,
    jobId: a.jobId,
    paperId: a.paperId ? String(a.paperId) : undefined,
    errorMessage: a.errorMessage,
    createdAt: a.createdAt?.toISOString?.() || a.createdAt,
    updatedAt: a.updatedAt?.toISOString?.() || a.updatedAt,
  };
}

function serializePaper(p: any) {
  return {
    _id: String(p._id),
    assignmentId: String(p.assignmentId),
    meta: p.meta,
    sections: p.sections,
    answerKey: p.answerKey,
    totals: p.totals,
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
  };
}

export default router;
