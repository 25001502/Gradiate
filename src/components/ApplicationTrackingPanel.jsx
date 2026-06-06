import {
  APPLICATION_TRACKING_STATUSES,
  getApplicationTrackingChecklist,
  getApplicationTrackingProgress,
  normalizeApplicationTracking,
} from "../lib/applicationTracking";

export default function ApplicationTrackingPanel({
  type,
  tracking,
  onStatusChange,
  onChecklistChange,
}) {
  const normalized = normalizeApplicationTracking(tracking, type);
  const checklistItems = getApplicationTrackingChecklist(type);
  const progress = getApplicationTrackingProgress(normalized, type);

  return (
    <section style={styles.panel} aria-label="Application tracker">
      <div style={styles.header}>
        <div>
          <strong style={styles.title}>Application Tracker</strong>
          <p style={styles.subtitle}>Track your progress for this saved opportunity.</p>
        </div>
        <span style={styles.progressBadge}>{progress.percent}%</span>
      </div>

      <label style={styles.field}>
        Status
        <select
          value={normalized.status}
          onChange={(event) => onStatusChange(event.target.value)}
          style={styles.select}
        >
          {APPLICATION_TRACKING_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <div style={styles.progressTrack} aria-hidden="true">
        <div style={{ ...styles.progressFill, width: `${progress.percent}%` }} />
      </div>
      <p style={styles.progressText}>
        {progress.completed} of {progress.total} steps completed
      </p>

      <div style={styles.checklist}>
        {checklistItems.map((item) => (
          <label key={item.key} style={styles.checklistItem}>
            <input
              type="checkbox"
              checked={normalized.checklist[item.key]}
              onChange={(event) => onChecklistChange(item.key, event.target.checked)}
              style={styles.checkbox}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

const styles = {
  panel: {
    display: "grid",
    gap: 10,
    padding: 12,
    border: "1px solid #dbeafe",
    borderRadius: 14,
    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    display: "block",
    color: "#172033",
    fontSize: "0.9rem",
    fontWeight: 800,
  },
  subtitle: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: "0.76rem",
    lineHeight: 1.35,
  },
  progressBadge: {
    minWidth: 44,
    borderRadius: 999,
    padding: "5px 8px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "0.76rem",
    fontWeight: 800,
    textAlign: "center",
  },
  field: {
    display: "grid",
    gap: 5,
    color: "#334155",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  select: {
    minHeight: 38,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#fff",
    color: "#172033",
    fontWeight: 700,
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #2563eb 0%, #16a34a 100%)",
    transition: "width 180ms ease",
  },
  progressText: {
    margin: "-3px 0 0",
    color: "#64748b",
    fontSize: "0.74rem",
    fontWeight: 700,
  },
  checklist: {
    display: "grid",
    gap: 7,
  },
  checklistItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#334155",
    fontSize: "0.8rem",
    lineHeight: 1.35,
  },
  checkbox: {
    width: 16,
    height: 16,
    accentColor: "#2563eb",
    flex: "0 0 auto",
  },
};
