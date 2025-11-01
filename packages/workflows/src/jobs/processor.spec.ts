import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type TestJob = {
  id?: string;
  attemptsMade?: number;
};

const queueAdd = vi.fn(async () => {});
const queueClose = vi.fn(async () => {});
const schedulerClose = vi.fn(async () => {});
const workerClose = vi.fn(async () => {});
const eventsClose = vi.fn(async () => {});

type JobEventHandler = (job: TestJob, err?: Error) => Promise<void> | void;
const handlers = new Map<string, JobEventHandler>();

vi.mock("bullmq", () => ({
  Queue: class {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
    add = queueAdd;
    close = queueClose;
  },
  QueueScheduler: class {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
    close = schedulerClose;
  },
  Worker: class {
    name: string;
    processor: (job: TestJob) => Promise<void> | void;
    constructor(name: string, processor: (job: TestJob) => Promise<void> | void) {
      this.name = name;
      this.processor = processor;
    }
    on(event: string, handler: JobEventHandler) {
      handlers.set(event, handler);
    }
    close = workerClose;
  },
  QueueEvents: class {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
    close = eventsClose;
  },
  JobsOptions: class {},
}));

vi.mock("node-cron", () => ({
  schedule: vi.fn(),
}));

import { enqueueJob, registerQueue, closeQueues } from "./processor";
import { JOB_DEFINITIONS } from "./definitions";

describe("registerQueue", () => {
  beforeEach(() => {
    queueAdd.mockClear();
    queueClose.mockClear();
    schedulerClose.mockClear();
    workerClose.mockClear();
    eventsClose.mockClear();
    handlers.clear();
  });

  afterEach(async () => {
    await closeQueues();
  });

  it("registers queue with retry settings", async () => {
    const onEscalate = vi.fn();
    const onCompleted = vi.fn();
    registerQueue("weekly_review", vi.fn(), { onEscalate, onCompleted });

    await enqueueJob("weekly_review", { foo: "bar" });

    expect(queueAdd).toHaveBeenCalledWith("weekly_review", { foo: "bar" }, {
      attempts: JOB_DEFINITIONS.weekly_review.retry.attempts,
      backoff: { type: "exponential", delay: JOB_DEFINITIONS.weekly_review.retry.backoffDelayMs },
    });

    const completedHandler = handlers.get("completed");
    expect(completedHandler).toBeDefined();
    if (completedHandler) {
      await completedHandler({ id: "1" });
      expect(onCompleted).toHaveBeenCalled();
    }

    const failedHandler = handlers.get("failed");
    expect(failedHandler).toBeDefined();
    if (failedHandler) {
      await failedHandler({ id: "2", attemptsMade: JOB_DEFINITIONS.weekly_review.escalationThreshold }, new Error("boom"));
      expect(onEscalate).toHaveBeenCalled();
    }
  });

  it("closes queues and clears cache", async () => {
    registerQueue("weekly_review", vi.fn());

    await closeQueues();

    expect(queueClose).toHaveBeenCalled();
    expect(workerClose).toHaveBeenCalled();
    expect(eventsClose).toHaveBeenCalled();
  });
});

