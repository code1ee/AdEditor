import type { PageSchema } from './page';

export interface WorkSchema {
  schemaVersion: string;
  id: string;
  title: string;
  description?: string;
  pages: PageSchema[];
  currentPageId?: string;
  createdAt?: string;
  updatedAt?: string;
}
