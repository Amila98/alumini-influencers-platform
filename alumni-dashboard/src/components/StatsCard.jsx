export default function StatsCard({
  theme = "purple",
  title,
  value,
  subtitle,
}) {
  const icons = {
    purple: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 8-4v6h2V7L12 2z" fill="currentColor" />
        <path
          d="M6 10v4c0 2.21 2.69 4 6 4s6-1.79 6-4v-4l-6 3-6-3z"
          fill="currentColor"
        />
      </svg>
    ),
    teal: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Briefcase body */}
        <rect x="3" y="8" width="18" height="12" rx="2" fill="currentColor" />

        {/* Handle */}
        <path
          d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M3 12h18" stroke="white" strokeWidth="1.5" opacity="0.8" />
      </svg>
    ),
    amber: (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* Medal circle */}
    <circle
      cx="12"
      cy="10"
      r="6"
      fill="currentColor"
    />

    {/* Ribbon */}
    <path
      d="M9 14l-2 6 5-3 5 3-2-6"
      fill="currentColor"
      opacity="0.9"
    />

    {/* Check mark */}
    <path
      d="M10 10.5l1.5 1.5 2.5-3"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
),
    coral: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 19.5A2.5 2.5 0 016.5 17H20"
          fill="currentColor"
          opacity="0.5"
        />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M8 7h8M8 11h8M8 15h5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  const accents = {
    purple: "rgba(175,169,236,0.9)",
    teal: "rgba(29,198,150,0.9)",
    amber: "rgba(251,191,36,0.9)",
    coral: "rgba(251,113,94,0.9)",
  };

  return (
    <div className={`stat-card--${theme}`}>
      <div className="stat-card-top">
        <div className="stat-card-icon-wrap" style={{ color: accents[theme] }}>
          {icons[theme]}
        </div>
        <span className="stat-card-label">{title}</span>
      </div>
      <span className="stat-card-value">{value.toLocaleString()}</span>
      {subtitle && <span className="stat-card-sub">{subtitle}</span>}
    </div>
  );
}
