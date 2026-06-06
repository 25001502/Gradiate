export const APPLICATION_TRACKING_TYPES = {
  university: "university",
  bursary: "bursary",
};

export const APPLICATION_TRACKING_STATUSES = [
  { value: "interested", label: "Interested" },
  { value: "preparing", label: "Preparing" },
  { value: "submitted", label: "Submitted" },
  { value: "awaiting_response", label: "Awaiting Response" },
  { value: "accepted", label: "Accepted" },
  { value: "not_selected", label: "Not Selected" },
];

const statusValues = new Set(APPLICATION_TRACKING_STATUSES.map((status) => status.value));

export const APPLICATION_TRACKING_CHECKLISTS = {
  [APPLICATION_TRACKING_TYPES.university]: [
    { key: "requirements", label: "Requirements checked" },
    { key: "documents", label: "Documents prepared" },
    { key: "online_application", label: "Online application completed" },
    { key: "fee_or_proof", label: "Fee/proof handled" },
    { key: "confirmation", label: "Confirmation saved" },
  ],
  [APPLICATION_TRACKING_TYPES.bursary]: [
    { key: "eligibility", label: "Eligibility checked" },
    { key: "documents", label: "Documents prepared" },
    { key: "motivation", label: "Motivation/essay prepared" },
    { key: "submitted", label: "Application submitted" },
    { key: "confirmation", label: "Confirmation saved" },
  ],
};

export const getApplicationTrackingChecklist = (type) =>
  APPLICATION_TRACKING_CHECKLISTS[type] || APPLICATION_TRACKING_CHECKLISTS[APPLICATION_TRACKING_TYPES.university];

export const getDefaultApplicationTracking = (type) => ({
  status: "interested",
  checklist: getApplicationTrackingChecklist(type).reduce((checklist, item) => {
    checklist[item.key] = false;
    return checklist;
  }, {}),
});

export const normalizeApplicationTracking = (tracking, type) => {
  const defaults = getDefaultApplicationTracking(type);
  const rawStatus = tracking?.status;
  const checklist = { ...defaults.checklist };

  getApplicationTrackingChecklist(type).forEach((item) => {
    checklist[item.key] = Boolean(tracking?.checklist?.[item.key]);
  });

  return {
    status: statusValues.has(rawStatus) ? rawStatus : defaults.status,
    checklist,
  };
};

export const getApplicationTrackingProgress = (tracking, type) => {
  const normalized = normalizeApplicationTracking(tracking, type);
  const checklistItems = getApplicationTrackingChecklist(type);
  const total = checklistItems.length;
  const completed = checklistItems.filter((item) => normalized.checklist[item.key]).length;

  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
};
