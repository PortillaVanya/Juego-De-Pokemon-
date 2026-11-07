import './SkeletonCard.css';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
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
