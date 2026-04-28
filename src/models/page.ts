import type { ElementSchema } from './element';

export interface PageSchema {
  id: string;
  title: string;
  backgroundColor: string;
  backgroundImage?: string;
  width: number;
  height: number;
  elements: ElementSchema[];
}
