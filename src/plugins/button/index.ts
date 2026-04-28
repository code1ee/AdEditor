import type { EditorPlugin } from '@/models/plugin';
import ButtonElement from './ButtonElement.vue';
import ButtonPropertyEditor from './ButtonPropertyEditor.vue';

export const buttonPlugin: EditorPlugin = {
  type: 'button',
  title: 'Button',
  icon: 'B',
  category: 'basic',
  component: ButtonElement,
  propertyEditor: ButtonPropertyEditor,
  defaultProps: {
    text: 'Button'
  },
  defaultStyle: {
    width: 140,
    height: 44,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    borderRadius: 6,
    fontSize: 16
  }
};
