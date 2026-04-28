import { readonly, ref } from 'vue';

export type Locale = 'en' | 'zh';

const STORAGE_KEY = 'adeditor.locale';

const messages = {
  en: {
    'app.name': 'AdEditor',
    'toolbar.save': 'Save',
    'toolbar.importJson': 'Import JSON',
    'toolbar.exportJson': 'Export JSON',
    'toolbar.preview': 'Preview',
    'toolbar.delete': 'Delete',
    'toolbar.undo': 'Undo',
    'toolbar.redo': 'Redo',
    'toolbar.copy': 'Copy',
    'toolbar.paste': 'Paste',
    'toolbar.align': 'Align',
    'toolbar.language': 'Language',
    'toolbar.saved': 'Saved',
    'toolbar.imported': 'Imported',
    'toolbar.importFailed': 'Import failed',
    'toolbar.loadFailed': 'Failed to load saved work.',
    'toolbar.saveFailed': 'Failed to save work.',
    'components.title': 'Components',
    'components.text': 'Text',
    'components.image': 'Image',
    'components.button': 'Button',
    'pages.title': 'Pages',
    'pages.add': 'Add',
    'pages.duplicate': 'Duplicate',
    'pages.delete': 'Delete',
    'layers.title': 'Layers',
    'layers.up': 'Up',
    'layers.down': 'Down',
    'layers.top': 'Top',
    'layers.bottom': 'Bottom',
    'layers.lock': 'Lock',
    'layers.hide': 'Hide',
    'layers.locked': 'Locked',
    'layers.hidden': 'Hidden',
    'align.left': 'Left',
    'align.center': 'Center',
    'align.right': 'Right',
    'align.top': 'Top',
    'align.middle': 'Middle',
    'align.bottom': 'Bottom',
    'align.distributeH': 'Distribute H',
    'align.distributeV': 'Distribute V',
    'canvas.pageSize': 'Page size',
    'canvas.pageWidth': 'Page width',
    'canvas.pageHeight': 'Page height',
    'properties.element': 'Element',
    'properties.empty': 'No element selected.',
    'properties.x': 'X',
    'properties.y': 'Y',
    'properties.width': 'Width',
    'properties.height': 'Height',
    'properties.zIndex': 'Z Index',
    'properties.opacity': 'Opacity',
    'properties.text': 'Text',
    'properties.imageUrl': 'Image URL',
    'properties.alt': 'Alt',
    'properties.buttonText': 'Button Text',
    'preview.backToEditor': 'Back to editor',
    'preview.pages': 'Preview pages',
    'validation.jsonParse': 'JSON text cannot be parsed.',
    'validation.workObject': 'Work must be an object.',
    'validation.workIdRequired': 'Work id is required.',
    'validation.workTitleRequired': 'Work title is required.',
    'validation.workPagesRequired': 'Work must contain at least one page.',
    'validation.currentPageId': 'currentPageId must match an existing page.',
    'validation.pageObject': 'Page must be an object.',
    'validation.pageIdRequired': 'Page id is required.',
    'validation.pageTitleRequired': 'Page title is required.',
    'validation.pageWidth': 'Page width must be positive and finite.',
    'validation.pageHeight': 'Page height must be positive and finite.',
    'validation.pageElements': 'Page elements must be an array.',
    'validation.elementObject': 'Element must be an object.',
    'validation.elementIdRequired': 'Element id is required.',
    'validation.elementProps': 'Element props must be an object.',
    'validation.elementStyle': 'Element style is required.',
    'validation.duplicateElementId': 'Duplicate element id: {id}.',
    'validation.unsupportedElementType': 'Unsupported element type: {type}.',
    'validation.elementGeometry': 'Element {id} geometry must fit inside page.',
    'validation.elementOpacity': 'Element {id} opacity must be between 0 and 1.'
  },
  zh: {
    'app.name': 'AdEditor',
    'toolbar.save': '保存',
    'toolbar.importJson': '导入 JSON',
    'toolbar.exportJson': '导出 JSON',
    'toolbar.preview': '预览',
    'toolbar.delete': '删除',
    'toolbar.undo': '撤销',
    'toolbar.redo': '重做',
    'toolbar.copy': '复制',
    'toolbar.paste': '粘贴',
    'toolbar.align': '对齐',
    'toolbar.language': '语言',
    'toolbar.saved': '已保存',
    'toolbar.imported': '已导入',
    'toolbar.importFailed': '导入失败',
    'toolbar.loadFailed': '加载已保存作品失败。',
    'toolbar.saveFailed': '保存作品失败。',
    'components.title': '组件',
    'components.text': '文本',
    'components.image': '图片',
    'components.button': '按钮',
    'pages.title': '页面',
    'pages.add': '新增',
    'pages.duplicate': '复制',
    'pages.delete': '删除',
    'layers.title': '图层',
    'layers.up': '上移',
    'layers.down': '下移',
    'layers.top': '置顶',
    'layers.bottom': '置底',
    'layers.lock': '锁定',
    'layers.hide': '隐藏',
    'layers.locked': '已锁定',
    'layers.hidden': '已隐藏',
    'align.left': '左对齐',
    'align.center': '水平居中',
    'align.right': '右对齐',
    'align.top': '顶对齐',
    'align.middle': '垂直居中',
    'align.bottom': '底对齐',
    'align.distributeH': '水平分布',
    'align.distributeV': '垂直分布',
    'canvas.pageSize': '页面尺寸',
    'canvas.pageWidth': '页面宽度',
    'canvas.pageHeight': '页面高度',
    'properties.element': '元素',
    'properties.empty': '未选中元素。',
    'properties.x': 'X',
    'properties.y': 'Y',
    'properties.width': '宽度',
    'properties.height': '高度',
    'properties.zIndex': '层级',
    'properties.opacity': '透明度',
    'properties.text': '文本',
    'properties.imageUrl': '图片地址',
    'properties.alt': '替代文本',
    'properties.buttonText': '按钮文字',
    'preview.backToEditor': '返回编辑器',
    'preview.pages': '预览页面',
    'validation.jsonParse': 'JSON 文本无法解析。',
    'validation.workObject': '作品必须是对象。',
    'validation.workIdRequired': '作品 ID 必填。',
    'validation.workTitleRequired': '作品标题必填。',
    'validation.workPagesRequired': '作品至少需要包含一个页面。',
    'validation.currentPageId': 'currentPageId 必须匹配已有页面。',
    'validation.pageObject': '页面必须是对象。',
    'validation.pageIdRequired': '页面 ID 必填。',
    'validation.pageTitleRequired': '页面标题必填。',
    'validation.pageWidth': '页面宽度必须是正有限数。',
    'validation.pageHeight': '页面高度必须是正有限数。',
    'validation.pageElements': '页面元素必须是数组。',
    'validation.elementObject': '元素必须是对象。',
    'validation.elementIdRequired': '元素 ID 必填。',
    'validation.elementProps': '元素属性必须是对象。',
    'validation.elementStyle': '元素样式必填。',
    'validation.duplicateElementId': '元素 ID 重复：{id}。',
    'validation.unsupportedElementType': '不支持的元素类型：{type}。',
    'validation.elementGeometry': '元素 {id} 的几何尺寸必须位于页面内。',
    'validation.elementOpacity': '元素 {id} 的透明度必须在 0 到 1 之间。'
  }
} as const;

type MessageKey = keyof typeof messages.en;

const locale = ref<Locale>(resolveInitialLocale());

export const localeOptions: Array<{ label: string; value: Locale }> = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' }
];

export function useI18n() {
  return {
    locale: readonly(locale),
    localeOptions,
    formatErrorMessage,
    setLocale,
    t
  };
}

export function t(key: MessageKey): string {
  return messages[locale.value][key] ?? messages.en[key] ?? key;
}

export function setLocale(nextLocale: Locale): void {
  locale.value = nextLocale;
  localStorage.setItem(STORAGE_KEY, nextLocale);
  document.documentElement.lang = nextLocale === 'zh' ? 'zh-CN' : 'en';
}

export function formatErrorMessage(message: string): string {
  return message
    .split('\n')
    .map((line) => formatErrorLine(line))
    .join('\n');
}

function formatErrorLine(line: string): string {
  const exactMatches: Record<string, MessageKey> = {
    'JSON text cannot be parsed.': 'validation.jsonParse',
    'Work must be an object.': 'validation.workObject',
    'Work id is required.': 'validation.workIdRequired',
    'Work title is required.': 'validation.workTitleRequired',
    'Work must contain at least one page.': 'validation.workPagesRequired',
    'Failed to load saved work.': 'toolbar.loadFailed',
    'Failed to save work.': 'toolbar.saveFailed',
    'currentPageId must match an existing page.': 'validation.currentPageId',
    'Page must be an object.': 'validation.pageObject',
    'Page id is required.': 'validation.pageIdRequired',
    'Page title is required.': 'validation.pageTitleRequired',
    'Page width must be positive and finite.': 'validation.pageWidth',
    'Page height must be positive and finite.': 'validation.pageHeight',
    'Page elements must be an array.': 'validation.pageElements',
    'Element must be an object.': 'validation.elementObject',
    'Element id is required.': 'validation.elementIdRequired',
    'Element props must be an object.': 'validation.elementProps',
    'Element style is required.': 'validation.elementStyle'
  };
  const exactKey = exactMatches[line];
  if (exactKey) return t(exactKey);

  const duplicateId = /^Duplicate element id: (.+)\.$/.exec(line);
  if (duplicateId) return interpolate(t('validation.duplicateElementId'), { id: duplicateId[1] });

  const unsupportedType = /^Unsupported element type: (.+)\.$/.exec(line);
  if (unsupportedType) return interpolate(t('validation.unsupportedElementType'), { type: unsupportedType[1] });

  const geometry = /^Element (.+) geometry must fit inside page\.$/.exec(line);
  if (geometry) return interpolate(t('validation.elementGeometry'), { id: geometry[1] });

  const opacity = /^Element (.+) opacity must be between 0 and 1\.$/.exec(line);
  if (opacity) return interpolate(t('validation.elementOpacity'), { id: opacity[1] });

  return line;
}

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

function resolveInitialLocale(): Locale {
  const storedLocale = localStorage.getItem(STORAGE_KEY);
  if (isLocale(storedLocale)) return storedLocale;

  const browserLocale = navigator.language.toLowerCase();
  return browserLocale.startsWith('zh') ? 'zh' : 'en';
}

function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'zh';
}

setLocale(locale.value);
