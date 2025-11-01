export type JobType = "weekly_review" | "pdca_job" | "export_markdown";

export interface RetryStrategy {
  attempts: number;
  backoffType: "exponential" | "fixed" | "none";
  backoffDelayMs: number;
}

export interface JobDefinition {
  type: JobType;
  queueName: string;
  retry: RetryStrategy;
  escalationThreshold: number;
}

export const JOB_DEFINITIONS: Record<JobType, JobDefinition> = {
  weekly_review: {
    type: "weekly_review",
    queueName: "weekly-review",
    retry: {
      attempts: 3,
      backoffType: "exponential",
      backoffDelayMs: 10 * 60 * 1000,
    },
    escalationThreshold: 2,
  },
  pdca_job: {
    type: "pdca_job",
    queueName: "pdca",
    retry: {
      attempts: 5,
      backoffType: "fixed",
      backoffDelayMs: 5 * 60 * 1000,
    },
    escalationThreshold: 3,
  },
  export_markdown: {
    type: "export_markdown",
    queueName: "export-markdown",
    retry: {
      attempts: 3,
      backoffType: "none",
      backoffDelayMs: 2 * 60 * 1000,
    },
    escalationThreshold: 3,
  },
};

