export interface PlaceholderEntity {
  id: string;
  createdAt: Date;
}

export const createPlaceholder = (id: string): PlaceholderEntity => ({
  id,
  createdAt: new Date(),
});

// Export PDCA domain models
export * from "./pdca";

// Export Tagging domain models
export * from "./tagging";

// Export Conversation domain models
export * from "./conversation";

