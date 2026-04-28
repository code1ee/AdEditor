import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PageRenderer from './PageRenderer.vue';
import { createDefaultPage } from '@/utils/createElement';

describe('PageRenderer', () => {
  it('renders page dimensions and excludes hidden elements', () => {
    const page = createDefaultPage();
    page.width = 123;
    page.height = 456;
    page.elements = [
      {
        id: 'visible',
        type: 'text',
        name: 'Text',
        locked: false,
        hidden: false,
        props: { text: 'Visible' },
        style: { x: 0, y: 0, width: 50, height: 20, zIndex: 2, opacity: 1 }
      },
      {
        id: 'hidden',
        type: 'text',
        name: 'Text',
        locked: false,
        hidden: true,
        props: { text: 'Hidden' },
        style: { x: 0, y: 0, width: 50, height: 20, zIndex: 1, opacity: 1 }
      }
    ];

    const wrapper = mount(PageRenderer, { props: { page } });

    expect(wrapper.attributes('style')).toContain('width: 123px');
    expect(wrapper.text()).toContain('Visible');
    expect(wrapper.text()).not.toContain('Hidden');
  });
});
