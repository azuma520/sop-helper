export interface WorkflowJob {
  name: string;
  schedule: string;
}

export const createWorkflowJob = (name: string, schedule: string): WorkflowJob => ({
  name,
  schedule,
});

