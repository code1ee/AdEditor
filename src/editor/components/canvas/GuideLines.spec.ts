import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GuideLines from './GuideLines.vue';

describe('GuideLines', () => {
  it('renders x and y guide lines', () => {
    const wrapper = mount(GuideLines, {
      props: {
        guides: [
          { axis: 'x', position: 10, source: 'page-edge' },
          { axis: 'y', position: 20, source: 'page-center' }
        ]
      }
    });
    expect(wrapper.findAll('div.absolute.bg-sky-500\\/80')).toHaveLength(2);
  });
});
