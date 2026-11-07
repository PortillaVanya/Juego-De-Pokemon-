import './SkeletonCard.css';

/** Placeholder visual que se muestra mientras un Pokémon carga. */
function SkeletonCard() {
  return (
    <div className="skeleton-card" data-testid="skeleton-card" role="status" aria-label="Cargando Pokémon">
      <div className="skeleton-box skeleton-badge" />
      <div className="skeleton-box skeleton-circle" />
      <div className="skeleton-box skeleton-title" />
      <div className="skeleton-pills">
        <div className="skeleton-box skeleton-pill" />
        <div className="skeleton-box skeleton-pill" />
      </div>
      <div className="skeleton-box skeleton-stats" />
    </div>
  );
}

export default SkeletonCard;
