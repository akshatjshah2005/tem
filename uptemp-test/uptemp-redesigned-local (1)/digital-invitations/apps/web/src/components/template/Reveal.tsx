'use client';

import { CSSProperties, ElementType, ReactNode, useEffect, useRef, useState } from 'react';

export type RevealAnim = 'up' | 'left' | 'right' | 'fade' | 'zoom';

interface RevealProps {
  children: ReactNode;
  anim?: RevealAnim;
  delay?: number;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
  id?: string;
}

/**
 * Scroll reveal wrapper. The initial state matches the server render (hidden),
 * then an IntersectionObserver promotes the node to `.is-visible`. Content is
 * never removed from the DOM, only transitioned, so it stays accessible to
 * search engines, screen readers and HTML assertions.
 */
export default function Reveal({
  children,
  anim = 'up',
  delay = 0,
  className = '',
  as,
  style,
  id
}: RevealProps) {
  const Tag = (as || 'div') as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      id={id}
      ref={ref as never}
      data-anim={anim}
      className={[className, visible ? 'is-visible' : ''].filter(Boolean).join(' ')}
      style={{ ...style, ['--d' as string]: `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
