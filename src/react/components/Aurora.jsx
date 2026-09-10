/** CSS-only animated aurora backdrop — the free-of-JS sibling of <GradientMesh />. */
export default function Aurora({ colors = ['#4f7cff', '#ff5f7e', '#2be3b0'], className = '' }) {
  return (
    <div className={`kx-aurora ${className}`} aria-hidden="true">
      {colors.map((c, i) => <span key={i} style={{ '--kx-aurora-color': c }} />)}
    </div>
  );
}
