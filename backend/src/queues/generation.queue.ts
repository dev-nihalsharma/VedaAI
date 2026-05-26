import { Queue } from 'bullmq';
import { bullConnectionOpts } from '../db/redis';

export const GENERATION_QUEUE_NAME = 'paper-generation';

export const generationQueue = new Queue(GENERATION_QUEUE_NAME, {
  connection: bullConnectionOpts,
});

export interface GenerationJobData {
  assignmentId: string;
}
