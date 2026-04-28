export interface EventConfig {
  type: 'click' | 'load';
  action: 'link' | 'page' | 'submit' | 'custom';
  value?: string;
}

export interface AnimationConfig {
  name: string;
  duration: number;
  delay: number;
  iterationCount?: number | 'infinite';
}

export interface ElementStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotate?: number;
  opacity?: number;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: string | number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

export interface ElementSchema {
  id: string;
  type: string;
  name: string;
  /** Locked elements stay selectable but normal editor mutations must be blocked. */
  locked: boolean;
  /** Hidden elements remain in Work JSON but are excluded from preview output and snap targets. */
  hidden: boolean;
  props: Record<string, unknown>;
  style: ElementStyle;
  events?: EventConfig[];
  animations?: AnimationConfig[];
}
