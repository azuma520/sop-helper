export type RedactionType = "email" | "phone" | "uuid" | "number";

export interface Redaction {
  type: RedactionType;
  value: string;
  replacement: string;
  index: number;
}

const PATTERNS: Array<{
  type: RedactionType;
  regex: RegExp;
  label: string;
}> = [
  {
    type: "email",
    label: "EMAIL",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g,
  },
  {
    type: "uuid",
    label: "UUID",
    regex: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/g,
  },
  {
    type: "phone",
    label: "PHONE",
    regex: /\b(?:\+?\d{1,3}[-\s])?(?:\d{2,4}[-\s]){2,}\d{2,4}\b/g,
  },
  {
    type: "number",
    label: "NUMBER",
    regex: /\b\d{4,}\b/g,
  },
];

const createPlaceholder = (label: string, index: number) => `{{REDACTED_${label}_${index}}}`;

export const maskSensitiveString = (input: string): { masked: string; redactions: Redaction[] } => {
  let masked = input;
  const redactions: Redaction[] = [];

  PATTERNS.forEach((pattern) => {
    let counter = 0;
    masked = masked.replace(pattern.regex, (match: string, offset: number) => {
      counter += 1;
      const placeholder = createPlaceholder(pattern.label, counter);
      redactions.push({
        type: pattern.type,
        value: match,
        replacement: placeholder,
        index: offset,
      });
      return placeholder;
    });
  });

  return { masked, redactions };
};

export const maskPayloadForLLM = (
  payload: unknown,
): { masked: string; redactions: Redaction[] } => {
  const source = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  return maskSensitiveString(source);
};

export const restoreRedactions = (masked: string, redactions: Redaction[]): string => {
  return redactions.reduce((text, redaction) => {
    return text.replace(redaction.replacement, redaction.value);
  }, masked);
};

