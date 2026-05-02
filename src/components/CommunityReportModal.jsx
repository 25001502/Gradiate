import { useEffect, useState } from "react";
import { FaFlag, FaTimes } from "react-icons/fa";
import { REPORT_REASONS } from "../lib/communityHelpers";

export default function CommunityReportModal({ reportDraft, submitting, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (reportDraft) {
      setSelectedReason(REPORT_REASONS[0]);
      setCustomReason("");
    }
  }, [reportDraft]);

  if (!reportDraft) {
    return null;
  }

  const isOther = selectedReason === "Other";
  const reason = isOther ? customReason.trim() : selectedReason;

  return (
    <div className="community-modal-backdrop" role="presentation">
      <section className="community-report-modal" role="dialog" aria-modal="true" aria-label="Report content">
        <div className="community-report-modal__header">
          <div>
            <p>Community safety</p>
            <h2>Report {reportDraft.targetType === "comment" ? "comment" : "post"}</h2>
          </div>
          <button className="community-icon-button" onClick={onClose} type="button" aria-label="Close report modal">
            <FaTimes />
          </button>
        </div>

        <label className="community-topic-control">
          <span>Reason</span>
          <select
            className="community-select"
            value={selectedReason}
            onChange={(event) => setSelectedReason(event.target.value)}
            disabled={submitting}
          >
            {REPORT_REASONS.map((reasonOption) => (
              <option key={reasonOption} value={reasonOption}>
                {reasonOption}
              </option>
            ))}
          </select>
        </label>

        {isOther && (
          <label className="community-topic-control">
            <span>Details</span>
            <textarea
              className="community-report-modal__textarea"
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value.slice(0, 280))}
              placeholder="Tell the moderators what happened."
              disabled={submitting}
            />
          </label>
        )}

        <div className="community-report-modal__actions">
          <button className="community-soft-button" onClick={onClose} type="button" disabled={submitting}>
            Cancel
          </button>
          <button
            className="community-danger-button"
            onClick={() => onSubmit(reason)}
            type="button"
            disabled={submitting || !reason}
          >
            <FaFlag /> {submitting ? "Sending..." : "Submit report"}
          </button>
        </div>
      </section>
    </div>
  );
}
