import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import { useEditorStore } from '@/editor/store/editor.store';
import PreviewPage from './PreviewPage.vue';

describe('PreviewPage productivity behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('renders page switch buttons for multi-page works', async () => {
    const router = createRouter({ history: createWebHistory(), routes: [] });
    vi.spyOn(router, 'push').mockResolvedValue(undefined);
    const store = useEditorStore();
    store.addPage();
    store.saveToLocalStorage();

    const wrapper = mount(PreviewPage, {
      global: {
        plugins: [router],
        stubs: { PageRenderer: true }
      }
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('button').length).toBeGreaterThanOrEqual(3);
  });
});
