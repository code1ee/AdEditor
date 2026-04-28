import { describe, expect, it } from 'vitest';
import { createPluginRegistry, pluginRegistry } from './index';
import { textPlugin } from './text';

describe('plugin registry', () => {
  it('registers MVP plugins', () => {
    expect(pluginRegistry.has('text')).toBe(true);
    expect(pluginRegistry.has('image')).toBe(true);
    expect(pluginRegistry.has('button')).toBe(true);
    expect(pluginRegistry.list()).toHaveLength(3);
  });

  it('rejects duplicate plugin types', () => {
    const registry = createPluginRegistry([textPlugin]);
    expect(() => registry.register(textPlugin)).toThrow('already registered');
  });
});
