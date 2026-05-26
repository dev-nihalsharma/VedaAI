import { Worker, Job } from 'bullmq';
import { Types } from 'mongoose';
import { bullConnectionOpts } from '../db/redis';
import { GENERATION_QUEUE_NAME, GenerationJobData } from './generation.queue';
import { AssignmentModel } from '../models/Assignment';
import { QuestionPaperModel } from '../models/QuestionPaper';
import { UserModel } from '../models/User';
import { generatePaper } from '../ai/claude.client';
import { buildUserPrompt } from '../ai/prompt';
import { emitJobUpdate } from '../ws/emit';
import { cacheSet } from '../utils/cache';

async function updateStatus(
  assignmentId: string,
  status: string,
  progress: number,
  message?: string
) {
  await AssignmentModel.updateOne({ _id: assignmentId }, { $set: { status } });
  emitJobUpdate(assignmentId, { type: 'status', status, progress, message });
}

export function startGenerationWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE_NAME,
    async (job: Job<GenerationJobData>) => {
      const { assignmentId } = job.data;
      console.log(`[worker] processing assignment ${assignmentId}`);

      const assignment = await AssignmentModel.findById(assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      const user = await UserModel.findById(assignment.userId);
      if (!user) throw new Error('User not found');

      try {
        await updateStatus(assignmentId, 'processing', 15, 'Preparing prompt');

        const userPrompt = buildUserPrompt(assignment, user.school);

        await updateStatus(assignmentId, 'generating', 45, 'Asking Claude to draft your paper');

        const paper = await generatePaper(userPrompt);

        await updateStatus(assignmentId, 'saving', 85, 'Saving results');

        const totals = paper.sections.reduce(
          (acc, s) => ({
            q: acc.q + s.questions.length,
            m: acc.m + s.questions.reduce((sum, q) => sum + q.marks, 0),
          }),
          { q: 0, m: 0 }
        );

        const paperDoc = await QuestionPaperModel.create({
          assignmentId: new Types.ObjectId(assignmentId),
          meta: paper.meta,
          sections: paper.sections,
          answerKey: paper.answerKey || [],
          totals: { questions: totals.q, marks: totals.m },
        });

        assignment.paperId = paperDoc._id;
        assignment.status = 'completed';
        assignment.errorMessage = undefined;
        await assignment.save();

        // Warm the cache so the very first GET on the output page hits Redis.
        await cacheSet(
          `paper:${String(paperDoc._id)}`,
          {
            _id: String(paperDoc._id),
            assignmentId: String(paperDoc.assignmentId),
            meta: paperDoc.meta,
            sections: paperDoc.sections,
            answerKey: paperDoc.answerKey,
            totals: paperDoc.totals,
            createdAt: paperDoc.createdAt?.toISOString?.() || new Date().toISOString(),
          },
          3600
        );

        emitJobUpdate(assignmentId, {
          type: 'status',
          status: 'completed',
          progress: 100,
          message: 'Done',
        });
        emitJobUpdate(assignmentId, {
          type: 'completed',
          paperId: String(paperDoc._id),
        });
      } catch (err: any) {
        console.error('[worker] generation failed', err);
        const errorMessage = err?.message || String(err);
        // Direct update so the new status takes effect even when the doc's
        // in-memory value happens to match (which would otherwise skip the
        // write via mongoose dirty-tracking on a retry attempt).
        await AssignmentModel.updateOne(
          { _id: assignmentId },
          { $set: { status: 'failed', errorMessage } }
        );
        emitJobUpdate(assignmentId, {
          type: 'status',
          status: 'failed',
          progress: 100,
          message: errorMessage,
        });
        emitJobUpdate(assignmentId, { type: 'error', message: errorMessage });
        throw err;
      }
    },
    {
      connection: bullConnectionOpts,
      concurrency: 2,
    }
  );

  worker.on('ready', () => console.log('[worker] ready'));
  worker.on('failed', (job, err) =>
    console.error(`[worker] job ${job?.id} failed: ${err.message}`)
  );

  return worker;
}
