export interface PlaceholderEntity {
  id: string;
  createdAt: Date;
}

export const createPlaceholder = (id: string): PlaceholderEntity => ({
  id,
  createdAt: new Date(),
});

