import { useEffect, useRef, useState } from 'react';
import { runPreloader } from '../../effects/loaders/preloader.js';

/**
 * Usage: <Preloader tasks={[...document.images].map(img => img.decode().catch(()=>{}))} />
 * Renders nothing once done (unmount it from a parent's onDone if you'd
 * rather remove it from the tree entirely).
 */
export default function Preloader({ tasks = [], minDuration = 800, onDone = () => {}, label = 'Loading' }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const firedTasks = useRef(tasks);

  useEffect(() => {
    runPreloader({
      tasks: firedTasks.current,
      minDuration,
      onProgress: setPct,
      onDone: () => { setDone(true); onDone(); }
    });
    // intentionally run once — tasks are captured at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;
  return (
    <div className="kx-preloader" aria-live="polite">
      <span className="kx-preloader-label">{label}</span>
      <span className="kx-preloader-count">{pct}</span>
    </div>
  );
}
