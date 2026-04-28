import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useEditorStore } from '@/editor/store/editor.store';
import LayerPanel from './LayerPanel.vue';

describe('LayerPanel', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('renders active page elements', () => {
    const store = useEditorStore();
    store.addElement('text');
    const wrapper = mount(LayerPanel, {
      global: {
        stubs: ['el-button']
      }
    });
    expect(wrapper.text()).toContain('Text');
  });
});
