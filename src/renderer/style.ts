import type { CSSProperties } from 'vue';
import type { ElementStyle } from '@/models/element';

export function toElementStyle(style: ElementStyle): CSSProperties {
  return {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    zIndex: style.zIndex,
    opacity: style.opacity ?? 1,
    color: style.color,
    backgroundColor: style.backgroundColor,
    fontSize: px(style.fontSize),
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    textAlign: style.textAlign,
    borderRadius: px(style.borderRadius),
    borderWidth: px(style.borderWidth),
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    paddingTop: px(style.paddingTop),
    paddingRight: px(style.paddingRight),
    paddingBottom: px(style.paddingBottom),
    paddingLeft: px(style.paddingLeft),
    transform: style.rotate ? `rotate(${style.rotate}deg)` : undefined,
    overflow: 'hidden'
  };
}

function px(value?: number): string | undefined {
  return typeof value === 'number' ? `${value}px` : undefined;
}
