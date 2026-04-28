import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import PropertyPanel from './PropertyPanel.vue';
import { useEditorStore } from '@/editor/store/editor.store';

describe('PropertyPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('shows element empty state', () => {
    const wrapper = mount(PropertyPanel, {
      global: { stubs: ['el-form', 'el-form-item', 'el-input-number', 'el-input'] }
    });

    expect(wrapper.text()).toContain('Element');
    expect(wrapper.text()).toContain('No element selected.');
  });

  it('shows element section after selection', () => {
    const store = useEditorStore();
    store.addElement('text');
    const wrapper = mount(PropertyPanel, {
      global: { stubs: ['el-form', 'el-form-item', 'el-input-number', 'el-input'] }
    });

    expect(wrapper.text()).toContain('Element');
  });
});
