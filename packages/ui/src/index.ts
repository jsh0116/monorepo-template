import type { ReactNode, RefObject, CSSProperties } from 'react';

export interface WithChildren {
  children?: ReactNode;
}

export interface WithClassName {
  className?: string;
}

/**
 * React v19 이상에서는 forwardRef를 사용해서 ref를 전달하지 않아도 된다.
 */
export interface WithRef<T> {
  ref: RefObject<T | null>;
}

export interface WithModal {
  modal: ReactNode;
}

export interface WithStyle {
  style?: CSSProperties;
}
