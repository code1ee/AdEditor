import type { EditorPlugin } from '@/models/plugin';
import ImageElement from './ImageElement.vue';
import ImagePropertyEditor from './ImagePropertyEditor.vue';

export const imagePlugin: EditorPlugin = {
  type: 'image',
  title: 'Image',
  icon: 'I',
  category: 'basic',
  component: ImageElement,
  propertyEditor: ImagePropertyEditor,
  defaultProps: {
    src: '',
    alt: ''
  },
  defaultStyle: {
    width: 180,
    height: 120,
    backgroundColor: '#e5e7eb'
  }
};
