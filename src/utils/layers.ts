import type { ElementSchema } from '@/models/element';

export function sortElementsByLayer(elements: ElementSchema[]): ElementSchema[] {
  return elements.slice().sort((a, b) => a.style.zIndex - b.style.zIndex || elements.indexOf(a) - elements.indexOf(b));
}

export function normalizeLayerOrder(elements: ElementSchema[]): ElementSchema[] {
  return elements.map((element, index) => ({
    ...element,
    style: {
      ...element.style,
      zIndex: index + 1
    }
  }));
}

export function moveLayer(elements: ElementSchema[], elementId: string, action: 'up' | 'down' | 'top' | 'bottom'): ElementSchema[] {
  const ordered = normalizeLayerOrder(sortElementsByLayer(elements));
  const index = ordered.findIndex((element) => element.id === elementId);
  if (index < 0 || ordered[index].locked) return ordered;

  const [item] = ordered.splice(index, 1);
  if (action === 'top') ordered.push(item);
  if (action === 'bottom') ordered.unshift(item);
  if (action === 'up') ordered.splice(Math.min(index + 1, ordered.length), 0, item);
  if (action === 'down') ordered.splice(Math.max(index - 1, 0), 0, item);

  return normalizeLayerOrder(ordered);
}

export function topmostElementId(elements: ElementSchema[]): string | null {
  return sortElementsByLayer(elements).filter((element) => !element.hidden).at(-1)?.id ?? null;
}
