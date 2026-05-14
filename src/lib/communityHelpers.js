import { DEFAULT_AVATAR_STYLE } from "../utils/avatarUtils";

export const POST_CATEGORIES = [
  { key: "general", label: "General", tone: "slate" },
  { key: "questions", label: "Questions", tone: "blue" },
  { key: "bursaries", label: "Bursaries", tone: "green" },
  { key: "applications", label: "Applications", tone: "orange" },
  { key: "study", label: "Study Tips", tone: "teal" },
  { key: "wins", label: "Wins", tone: "gold" },
];

export const COMMUNITY_SORT_OPTIONS = [
  { key: "latest", label: "Latest" },
  { key: "mostLiked", label: "Most liked" },
  { key: "mostCommented", label: "Most commented" },
  { key: "mostSaved", label: "Most saved" },
  { key: "answered", label: "Answered questions" },
  { key: "unanswered", label: "Unanswered questions" },
];

export const REPORT_REASONS = [
  "Misleading information",
  "Fake bursary/opportunity",
  "Harassment or disrespect",
  "Spam",
  "Inappropriate content",
  "Other",
];

export const POST_TEMPLATES = {
  bursaries:
    "Bursary name:\nClosing date:\nWho can apply:\nApplication link:\nExtra notes:",
  questions:
    "Module:\nTopic:\nWhat I tried:\nWhere I am stuck:",
  study:
    "Study tip:\nModule/subject:\nWhy it helps:",
  wins:
    "My win:\nWhat helped me:\nAdvice for others:",
};

export const MAX_POST_LENGTH = 800;
export const MAX_COMMENT_LENGTH = 420;
export const POSTS_LIMIT = 40;
export const COMMENTS_LIMIT = 8;
export const REPORT_PREVIEW_LENGTH = 240;

export const categoryByKey = POST_CATEGORIES.reduce((map, category) => {
  map[category.key] = category;
  return map;
}, {});

export function createCommunityPostPath(postId) {
  return `/community/post/${postId}`;
}

export function getDisplayName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "Gradiate Student";
}

export function formatCommunityDate(value) {
  const date = typeof value?.toDate === "function" ? value.toDate() : null;

  if (!date) {
    return "Just now";
  }

  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTimestampMillis(value) {
  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }

  return 0;
}

export function normalizeModuleCode(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40).toUpperCase();
}

export function getAuthorSnapshot(user, profile = {}, isAdmin = false) {
  const authorName = getDisplayName(user);
  const avatarSeed = profile.avatarSeed || user?.uid || "";
  const avatarStyle = profile.avatarStyle || DEFAULT_AVATAR_STYLE;

  return {
    authorId: user.uid,
    authorName,
    authorPhotoURL: profile.photoURL || user.photoURL || "",
    authorAvatarSeed: avatarSeed,
    authorAvatarStyle: avatarStyle,
    authorUniversity: String(profile.university || "").trim(),
    authorProgram: String(profile.program || "").trim(),
    authorYearOfStudy: String(profile.yearOfStudy || "").trim(),
    authorIsAdmin: Boolean(isAdmin),
  };
}

export function getAuthorAcademicLine(author = {}) {
  return [
    author.authorUniversity,
    author.authorProgram,
    author.authorYearOfStudy,
  ]
    .filter(Boolean)
    .join(" • ");
}

export function getPostLikeCount(post = {}, engagement = {}) {
  return Number.isFinite(post.likeCount) ? post.likeCount : engagement.likeCount || 0;
}

export function getPostCommentCount(post = {}, engagement = {}) {
  if (Number.isFinite(post.commentCount)) {
    return post.commentCount;
  }

  return engagement.commentCount || engagement.comments?.length || 0;
}

export function getPostSaveCount(post = {}) {
  return Number.isFinite(post.saveCount) ? post.saveCount : 0;
}

export function sortCommunityPosts(posts, sortKey, engagementByPost = {}) {
  const sorted = [...posts];

  sorted.sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) {
      return a.pinned ? -1 : 1;
    }

    if (a.pinned && b.pinned) {
      return getTimestampMillis(b.pinnedAt) - getTimestampMillis(a.pinnedAt);
    }

    if (sortKey === "mostLiked") {
      return getPostLikeCount(b, engagementByPost[b.id]) - getPostLikeCount(a, engagementByPost[a.id]);
    }

    if (sortKey === "mostCommented") {
      return getPostCommentCount(b, engagementByPost[b.id]) - getPostCommentCount(a, engagementByPost[a.id]);
    }

    if (sortKey === "mostSaved") {
      return getPostSaveCount(b) - getPostSaveCount(a);
    }

    return getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt);
  });

  return sorted;
}
