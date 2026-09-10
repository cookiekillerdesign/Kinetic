import { useEffect } from 'react';
import { initBlobCursor } from '../../effects/cursor/blobCursor.js';

/**
 * Drop <BlobCursor /> once, near the root of your app — an alternative to
 * <Cursor /> for a softer, liquid pointer instead of the crosshair ring.
 * Renders nothing itself; the effect builds its own SVG overlay.
 */
export default function BlobCursor({ count = 5, size = 22, color = '#4f6bff' }) {
  useEffect(() => {
    let destroy;
    try {
      destroy = initBlobCursor({ count, size, color });
    } catch (err) {
      console.error('[kinetic] BlobCursor init failed:', err);
      return undefined;
    }
    return () => { try { destroy(); } catch (err) { console.error('[kinetic] BlobCursor cleanup failed:', err); } };
  }, [count, size, color]);

  return null;
}
