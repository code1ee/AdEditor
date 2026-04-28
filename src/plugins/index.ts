import type { EditorPlugin, PluginRegistry } from '@/models/plugin';
import { buttonPlugin } from './button';
import { imagePlugin } from './image';
import { textPlugin } from './text';

class InMemoryPluginRegistry implements PluginRegistry {
  private readonly plugins = new Map<string, EditorPlugin>();

  register(plugin: EditorPlugin): void {
    if (this.plugins.has(plugin.type)) {
      throw new Error(`Plugin type already registered: ${plugin.type}`);
    }
    this.plugins.set(plugin.type, plugin);
  }

  get(type: string): EditorPlugin | undefined {
    return this.plugins.get(type);
  }

  list(): EditorPlugin[] {
    return Array.from(this.plugins.values());
  }

  has(type: string): boolean {
    return this.plugins.has(type);
  }
}

export function createPluginRegistry(plugins: EditorPlugin[] = []): PluginRegistry {
  const registry = new InMemoryPluginRegistry();
  plugins.forEach((plugin) => registry.register(plugin));
  return registry;
}

export const pluginRegistry = createPluginRegistry([textPlugin, imagePlugin, buttonPlugin]);
