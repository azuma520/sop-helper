import { Queue, QueueScheduler, Worker, JobsOptions, QueueEvents, Job } from "bullmq";
import { JOB_DEFINITIONS, JobType } from "./definitions";

export interface QueueRegistry {
  queue: Queue;
  scheduler: QueueScheduler;
  worker?: Worker;
  events: QueueEvents;
}

const cache = new Map<JobType, QueueRegistry>();

const toBullOptions = (jobType: JobType): JobsOptions => {
  const def = JOB_DEFINITIONS[jobType];
  const { backoffType, backoffDelayMs, attempts } = def.retry;
  return {
    attempts,
    backoff:
      backoffType === "none"
        ? undefined
        : backoffType === "fixed"
        ? { type: "fixed", delay: backoffDelayMs }
        : { type: "exponential", delay: backoffDelayMs },
  };
};

interface BaseHandlers {
  onEscalate?: (job: Job, error: Error) => Promise<void>;
  onCompleted?: (job: Job) => Promise<void>;
}

export const registerQueue = (
  jobType: JobType,
  handler: (job: Job) => Promise<void>,
  baseHandlers: BaseHandlers = {},
): QueueRegistry => {
  if (cache.has(jobType)) {
    return cache.get(jobType)!;
  }

  const definition = JOB_DEFINITIONS[jobType];
  const queue = new Queue(definition.queueName);
  const scheduler = new QueueScheduler(definition.queueName);
  const events = new QueueEvents(definition.queueName);

  const worker = new Worker(definition.queueName, async (job) => {
    await handler(job);
  });

  const { onEscalate, onCompleted } = baseHandlers;
  if (onCompleted) {
    worker.on("completed", (job) => onCompleted(job));
  }

  worker.on("failed", async (job, err) => {
    if (!job || !onEscalate) {
      return;
    }
    const attempts = job.attemptsMade ?? 0;
    if (attempts >= definition.escalationThreshold) {
      await onEscalate(job, err);
    }
  });

  cache.set(jobType, { queue, scheduler, worker, events });
  return cache.get(jobType)!;
};

export const enqueueJob = async (
  jobType: JobType,
  payload: unknown,
  options: JobsOptions = {},
) => {
  const registry = cache.get(jobType);
  if (!registry) {
    throw new Error(`Queue ${jobType} not registered`);
  }
  await registry.queue.add(jobType, payload, { ...toBullOptions(jobType), ...options });
};

export const closeQueues = async () => {
  for (const registry of cache.values()) {
    await Promise.all([
      registry.worker?.close(),
      registry.queue.close(),
      registry.scheduler.close(),
      registry.events.close(),
    ]);
  }
  cache.clear();
};

