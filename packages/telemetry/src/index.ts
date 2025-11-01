export type TraceAttributes = Record<string, string | number | boolean>;

export const formatTrace = (name: string, attributes: TraceAttributes = {}): string => {
  return `${name}::${JSON.stringify(attributes)}`;
};

