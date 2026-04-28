import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import EditorToolbar from './EditorToolbar.vue';

describe('EditorToolbar productivity commands', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('renders undo redo copy paste controls', () => {
    const router = createRouter({ history: createWebHistory(), routes: [] });
    const wrapper = mount(EditorToolbar, {
      global: {
        plugins: [router],
        stubs: {
          'el-button': { template: '<button><slot /></button>' },
          'el-upload': { template: '<div><slot /></div>' },
          'el-select': { template: '<div><slot /></div>' },
          'el-option': true,
          'el-dropdown': { template: '<div><slot /><slot name="dropdown" /></div>' },
          'el-dropdown-menu': { template: '<div><slot /></div>' },
          'el-dropdown-item': { template: '<button><slot /></button>' }
        }
      }
    });
    expect(wrapper.text()).toContain('Undo');
    expect(wrapper.text()).toContain('Redo');
    expect(wrapper.text()).toContain('Copy');
    expect(wrapper.text()).toContain('Paste');
  });
});
