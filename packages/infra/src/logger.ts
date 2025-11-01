export type InfraLogger = {
  log: (message: string, context?: Record<string, unknown>) => void;
};

export const consoleLogger: InfraLogger = {
  log: (message, context) => {
    // eslint-disable-next-line no-console
    console.info(message, context ?? {});
  },
};

