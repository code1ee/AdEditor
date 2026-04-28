import type { Component } from 'vue';
import type { ElementStyle } from './element';

export interface EditorPlugin {
  type: string;
  title: string;
  icon: string;
  category: string;
  component: Component;
  defaultProps: Record<string, unknown>;
  defaultStyle: Partial<ElementStyle>;
  propertyEditor?: Component;
}

export interface PluginRegistry {
  register(plugin: EditorPlugin): void;
  get(type: string): EditorPlugin | undefined;
  list(): EditorPlugin[];
  has(type: string): boolean;
}
