import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import PagePanel from './PagePanel.vue';

describe('PagePanel', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('renders page controls', () => {
    const wrapper = mount(PagePanel, {
      global: {
        stubs: ['el-button']
      }
    });
    expect(wrapper.text()).toContain('Pages');
  });
});
