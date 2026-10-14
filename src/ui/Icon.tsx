/**
 * Bespoke icon set. 20x20 box, 1.25px stroke, butt caps, miter joins,
 * geometry on a 2px grid. No icon library anywhere in this product.
 */
import React from 'react';

export type IconName =
  | 'goldm' | 'goldten' | 'goldguinea' | 'goldpetal'
  | 'caret-up' | 'caret-down' | 'caret-left' | 'caret-right'
  | 'sort' | 'sort-asc' | 'sort-desc'
  | 'balance' | 'seal' | 'ledger' | 'calendar' | 'curve' | 'matrix'
  | 'settings' | 'account' | 'signout' | 'close' | 'expand'
  | 'filter' | 'download' | 'search' | 'info' | 'warning'
  | 'plus' | 'minus' | 'equals' | 'divide' | 'multiply'
  | 'check' | 'external' | 'menu' | 'theme';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  title?: string;
}

const P: Record<IconName, React.ReactNode> = {
  // --- Contract marks: cast bars, struck coin, thin disc ---
  goldm: <><path d="M2.5 13.5 L5 7.5 L17.5 7.5 L15 13.5 Z" /><path d="M5 10.5 L17.5 10.5" /></>,
  goldten: <><path d="M4.5 13 L6.5 8.5 L15.5 8.5 L13.5 13 Z" /><path d="M6.5 10.75 L15.5 10.75" /></>,
  goldguinea: <><circle cx="10" cy="10" r="6.5" /><circle cx="10" cy="10" r="4" /></>,
  goldpetal: <><ellipse cx="10" cy="10" rx="7" ry="2.75" /><path d="M3 10 L3 11.25" /><path d="M17 10 L17 11.25" /></>,

  // --- Direction and sort ---
  'caret-up': <path d="M5 12.5 L10 7 L15 12.5" />,
  'caret-down': <path d="M5 7.5 L10 13 L15 7.5" />,
  'caret-left': <path d="M12.5 5 L7 10 L12.5 15" />,
  'caret-right': <path d="M7.5 5 L13 10 L7.5 15" />,
  sort: <><path d="M6 8.5 L10 4.5 L14 8.5" /><path d="M6 11.5 L10 15.5 L14 11.5" /></>,
  'sort-asc': <><path d="M6 8.5 L10 4.5 L14 8.5" /><path d="M10 4.5 L10 15.5" /></>,
  'sort-desc': <><path d="M6 11.5 L10 15.5 L14 11.5" /><path d="M10 15.5 L10 4.5" /></>,

  // --- Instruments ---
  balance: <><path d="M10 3.5 L10 16.5" /><path d="M3 6.5 L17 6.5" /><path d="M3 6.5 L1.5 11 L4.5 11 Z" /><path d="M17 6.5 L15.5 11 L18.5 11 Z" /><path d="M6.5 16.5 L13.5 16.5" /></>,
  seal: <><circle cx="10" cy="10" r="6.5" /><path d="M10 6 L11.3 8.9 L14.4 9.2 L12 11.3 L12.8 14.4 L10 12.7 L7.2 14.4 L8 11.3 L5.6 9.2 L8.7 8.9 Z" /></>,
  ledger: <><rect x="3.5" y="3" width="13" height="14" /><path d="M6.5 3 L6.5 17" /><path d="M9 7 L14 7" /><path d="M9 10 L14 10" /><path d="M9 13 L14 13" /></>,
  calendar: <><rect x="3" y="4.5" width="14" height="12.5" /><path d="M3 8.5 L17 8.5" /><path d="M6.5 2.5 L6.5 6" /><path d="M13.5 2.5 L13.5 6" /></>,
  curve: <><path d="M2.5 15 C6 15 7 6 11 6 C14 6 15.5 9.5 17.5 9.5" /><path d="M2.5 17.5 L17.5 17.5" /><path d="M2.5 17.5 L2.5 3" /></>,
  matrix: <><rect x="3" y="3" width="14" height="14" /><path d="M7.67 3 L7.67 17" /><path d="M12.33 3 L12.33 17" /><path d="M3 7.67 L17 7.67" /><path d="M3 12.33 L17 12.33" /></>,

  // --- Chrome ---
  settings: <><circle cx="10" cy="10" r="2.75" /><path d="M10 2.5 L10 5" /><path d="M10 15 L10 17.5" /><path d="M2.5 10 L5 10" /><path d="M15 10 L17.5 10" /><path d="M4.7 4.7 L6.5 6.5" /><path d="M13.5 13.5 L15.3 15.3" /><path d="M15.3 4.7 L13.5 6.5" /><path d="M6.5 13.5 L4.7 15.3" /></>,
  account: <><circle cx="10" cy="7" r="3.25" /><path d="M3.75 17 C3.75 13.3 6.5 11.5 10 11.5 C13.5 11.5 16.25 13.3 16.25 17" /></>,
  signout: <><path d="M12.5 6 L12.5 3.5 L3.5 3.5 L3.5 16.5 L12.5 16.5 L12.5 14" /><path d="M8.5 10 L17 10" /><path d="M14 7 L17 10 L14 13" /></>,
  close: <><path d="M5 5 L15 15" /><path d="M15 5 L5 15" /></>,
  expand: <><path d="M4 8 L4 4 L8 4" /><path d="M16 12 L16 16 L12 16" /><path d="M4 4 L9 9" /><path d="M16 16 L11 11" /></>,
  filter: <><path d="M3 5 L17 5" /><path d="M6 10 L14 10" /><path d="M8.5 15 L11.5 15" /></>,
  download: <><path d="M10 3 L10 13" /><path d="M6 9.5 L10 13.5 L14 9.5" /><path d="M3.5 16.5 L16.5 16.5" /></>,
  search: <><circle cx="9" cy="9" r="5.25" /><path d="M12.9 12.9 L17 17" /></>,
  info: <><circle cx="10" cy="10" r="7" /><path d="M10 9 L10 14" /><path d="M10 6.25 L10 7.25" /></>,
  warning: <><path d="M10 2.75 L18 16.5 L2 16.5 Z" /><path d="M10 7.75 L10 12" /><path d="M10 13.9 L10 14.9" /></>,

  // --- Arithmetic, used in the SFV assembly ---
  plus: <><path d="M10 4.5 L10 15.5" /><path d="M4.5 10 L15.5 10" /></>,
  minus: <path d="M4.5 10 L15.5 10" />,
  equals: <><path d="M4.5 7.5 L15.5 7.5" /><path d="M4.5 12.5 L15.5 12.5" /></>,
  divide: <><path d="M4.5 10 L15.5 10" /><path d="M10 5.5 L10 6.5" /><path d="M10 13.5 L10 14.5" /></>,
  multiply: <><path d="M5.5 5.5 L14.5 14.5" /><path d="M14.5 5.5 L5.5 14.5" /></>,

  check: <path d="M4 10.5 L8 14.5 L16 5.5" />,
  external: <><path d="M11 4 L16 4 L16 9" /><path d="M16 4 L9.5 10.5" /><path d="M14 12 L14 16 L4 16 L4 6 L8 6" /></>,
  menu: <><path d="M3 6 L17 6" /><path d="M3 10 L17 10" /><path d="M3 14 L17 14" /></>,
  theme: <><circle cx="10" cy="10" r="6.25" /><path d="M10 3.75 L10 16.25" /><path d="M10 16.25 A6.25 6.25 0 0 0 10 3.75" fill="currentColor" stroke="none" /></>,
};

export function Icon({ name, size = 20, title, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {P[name]}
    </svg>
  );
}

/** 6px solid triangle. The only delta glyph. Never an animated arrow. */
export function Delta({ value, size = 6 }: { value: number; size?: number }) {
  if (value === 0) return null;
  const up = value > 0;
  return (
    <svg width={size} height={size} viewBox="0 0 6 6" aria-hidden="true" focusable="false" style={{ flex: 'none' }}>
      <path d={up ? 'M3 0.5 L5.8 5.5 L0.2 5.5 Z' : 'M3 5.5 L0.2 0.5 L5.8 0.5 Z'} fill="currentColor" />
    </svg>
  );
}
