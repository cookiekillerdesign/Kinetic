import { useEffect, useState } from 'react';

/**
 * JSX port of cookiekiller's SplitChars — kept as a standalone component
 * (rather than routed through the generic effect engine) because building
 * the spans as React children, not raw DOM nodes, is what lets React own
 * reconciliation when `text` changes.
 *
 * Usage: <SplitText text={t('hero.title')} key={lang} as="h1" />
 */
export default function SplitText({ text, className = '', as: Tag = 'span', baseDelay = 0.05, step = 0.026 }) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setInView(true), RM ? 0 : 30);
    return () => clearTimeout(t);
  }, []);

  let idx = 0;
  return (
    <Tag className={`kx-split${inView ? ' in' : ''} ${className}`}>
      {[...text].map((c, i) => c === ' '
        ? <span className="sp" key={i}> </span>
        : <span className="ch" style={{ transitionDelay: (baseDelay + (idx++) * step).toFixed(3) + 's' }} key={i}>{c}</span>
      )}
    </Tag>
  );
}
