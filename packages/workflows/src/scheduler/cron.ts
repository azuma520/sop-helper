import cron from "node-cron";
import { enqueueJob } from "../jobs/processor";
import { JobType } from "../jobs/definitions";

interface CronTaskDefinition {
  id: string;
  description: string;
  schedule: string;
  jobType: JobType;
  payload: () => unknown | Promise<unknown>;
}

const TASKS: CronTaskDefinition[] = [
  {
    id: "weekly-review",
    description: "每週五 16:00 產生週回顧草稿",
    schedule: "0 16 * * FRI",
    jobType: "weekly_review",
    payload: () => ({ triggeredAt: new Date().toISOString() }),
  },
];

export const startCronScheduler = () => {
  TASKS.forEach((task) => {
    cron.schedule(task.schedule, async () => {
      const payload = await task.payload();
      await enqueueJob(task.jobType, payload);
    });
  });
};

