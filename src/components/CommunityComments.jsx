import { FaCheck, FaCommentDots, FaFlag, FaPaperPlane, FaTrash } from "react-icons/fa";
import CommunityAvatar from "./CommunityAvatar";
import {
  formatCommunityDate,
  getAuthorAcademicLine,
  getPostCommentCount,
} from "../lib/communityHelpers";

export default function CommunityComments({
  post,
  engagement = {},
  isExpanded,
  isGuest,
  user,
  isCommunityAdmin,
  busyPostId,
  draft,
  alwaysExpanded = false,
  onToggleComments,
  onDraftChange,
  onCreateComment,
  onDeleteComment,
  onReport,
  onMarkAnswer,
}) {
  const comments = engagement.comments || [];
  const commentCount = getPostCommentCount(post, engagement);
  const canAcceptAnswers = post.category === "questions" && (user?.uid === post.authorId || isCommunityAdmin);
  const shouldShowComments = alwaysExpanded || isExpanded;

  return (
    <div className="community-comments">
      {alwaysExpanded ? (
        <div className="community-comments-heading">
          <FaCommentDots /> Comments ({commentCount})
        </div>
      ) : (
        <button className="community-comments-toggle" onClick={() => onToggleComments(post.id)} type="button">
          <FaCommentDots />
          {isExpanded ? "Hide comments" : `View comments (${commentCount})`}
        </button>
      )}

      {shouldShowComments && (
        <>
          {comments.length ? (
            comments.map((comment) => {
              const canDeleteComment =
                user?.uid === comment.authorId || user?.uid === post.authorId || isCommunityAdmin;
              const isAccepted = post.acceptedCommentId === comment.id;
              const commentAcademicLine = getAuthorAcademicLine(comment);

              return (
                <div
                  className={`community-comment ${isAccepted ? "community-comment--accepted" : ""}`}
                  key={comment.id}
                >
                  <CommunityAvatar
                    name={comment.authorName}
                    photoURL={comment.authorPhotoURL}
                    avatarSeed={comment.authorAvatarSeed}
                    avatarStyle={comment.authorAvatarStyle}
                    size="sm"
                  />
                  <div className="community-comment__body">
                    <div className="community-comment__head">
                      <strong>{comment.authorName || "Student"}</strong>
                      <span>{formatCommunityDate(comment.createdAt)}</span>
                    </div>
                    {commentAcademicLine && (
                      <small className="community-author__academic">{commentAcademicLine}</small>
                    )}
                    {isAccepted && (
                      <span className="community-answer-badge community-answer-badge--accepted">
                        <FaCheck /> Accepted answer
                      </span>
                    )}
                    <p>{comment.content}</p>
                  </div>
                  {canAcceptAnswers && !isAccepted && (
                    <button
                      className="community-soft-button community-soft-button--compact"
                      onClick={() => onMarkAnswer(post, comment)}
                      type="button"
                      disabled={busyPostId === post.id}
                    >
                      <FaCheck /> Mark as Answer
                    </button>
                  )}
                  {!isGuest && user?.uid !== comment.authorId && (
                    <button
                      className="community-icon-button community-icon-button--quiet"
                      onClick={() => onReport({ targetType: "comment", post, comment })}
                      type="button"
                      aria-label="Report comment"
                      title="Report comment"
                    >
                      <FaFlag />
                    </button>
                  )}
                  {canDeleteComment && (
                    <button
                      className="community-icon-button community-icon-button--quiet"
                      onClick={() => onDeleteComment(post, comment.id)}
                      type="button"
                      aria-label="Delete comment"
                      title="Delete comment"
                      disabled={busyPostId === post.id}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="community-comment-empty">No comments yet. Start the discussion.</p>
          )}

          <div className="community-comment-form">
            <input
              value={draft || ""}
              onChange={(event) => onDraftChange(post.id, event.target.value)}
              placeholder={isGuest ? "Sign in to comment" : "Write a comment"}
              disabled={isGuest || busyPostId === post.id}
            />
            <button
              onClick={() => onCreateComment(post)}
              type="button"
              disabled={isGuest || busyPostId === post.id || !String(draft || "").trim()}
              aria-label="Post comment"
              title="Post comment"
            >
              <FaPaperPlane />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
