import type { EditorPlugin } from '@/models/plugin';
import TextElement from './TextElement.vue';
import TextPropertyEditor from './TextPropertyEditor.vue';

export const textPlugin: EditorPlugin = {
  type: 'text',
  title: 'Text',
  icon: 'T',
  category: 'basic',
  component: TextElement,
  propertyEditor: TextPropertyEditor,
  defaultProps: {
    text: 'Text'
  },
  defaultStyle: {
    width: 160,
    height: 48,
    color: '#111827',
    fontSize: 18,
    lineHeight: 1.4
  }
};
