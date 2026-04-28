import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PreviewPage from './PreviewPage.vue';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

describe('PreviewPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('renders preview without editor controls', () => {
    const wrapper = mount(PreviewPage, {
      global: {
        stubs: {
          PageRenderer: { template: '<div data-preview-page style="width: 375px; height: 667px;" />' }
        }
      }
    });

    expect(wrapper.find('[data-preview-page]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('Components');
    expect(wrapper.text()).not.toContain('Property');
  });
});
