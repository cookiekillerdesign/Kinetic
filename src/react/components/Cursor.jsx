import { useEffect, useRef } from 'react';
import { initCustomCursor } from '../../effects/cursor/customCursor.js';

/**
 * Drop <Cursor /> once, near the root of your app (mirrors cookiekiller's
 * own Cursor.jsx). Renders nothing visible on touch devices — the effect
 * itself checks pointer capability and no-ops there.
 */
export default function Cursor({ speed = 0.2 }) {
  const cursorRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    let destroy;
    try {
      destroy = initCustomCursor({ cursorEl: cursorRef.current, labelEl: labelRef.current, speed });
    } catch (err) {
      console.error('[kinetic] Cursor init failed:', err);
      return undefined;
    }
    return () => { try { destroy(); } catch (err) { console.error('[kinetic] Cursor cleanup failed:', err); } };
  }, [speed]);

  return (
    <>
      <div className="kx-cursor" ref={cursorRef} aria-hidden="true">
        <span className="kx-cursor-ring">
          <i className="tick tl" /><i className="tick tr" /><i className="tick bl" /><i className="tick br" />
          <i className="dot" />
        </span>
      </div>
      <div className="kx-cursor-label" ref={labelRef} aria-hidden="true" />
    </>
  );
}
