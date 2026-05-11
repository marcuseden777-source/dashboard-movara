interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ label, value, sub, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && (
        <div className={`stat-sub${trend ? ` trend-${trend}` : ''}`}>{sub}</div>
      )}
    </div>
  );
}
