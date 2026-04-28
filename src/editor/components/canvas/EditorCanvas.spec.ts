import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import EditorCanvas from './EditorCanvas.vue';

describe('EditorCanvas productivity integration', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('renders guide line layer with the canvas', () => {
    const wrapper = mount(EditorCanvas, {
      global: {
        stubs: ['el-input-number', 'CanvasElement']
      }
    });
    expect(wrapper.find('[data-guide-lines]').exists()).toBe(true);
  });
});
