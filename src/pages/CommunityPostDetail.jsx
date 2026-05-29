import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  FaArrowLeft,
  FaBookmark,
  FaBullhorn,
  FaCheck,
  FaCommentDots,
  FaFlag,
  FaHeart,
  FaRegBookmark,
  FaRegHeart,
  FaThumbtack,
  FaTrash,
} from "react-icons/fa";
import CommunityAvatar from "../components/CommunityAvatar";
import CommunityComments from "../components/CommunityComments";
import CommunityReportModal from "../components/CommunityReportModal";
import AdminBadge from "../components/AdminBadge";
import { useAuth } from "../context/useAuth";
import { db } from "../lib/firebase/firestore";
import { routes } from "../lib/routes";
import {
  REPORT_PREVIEW_LENGTH,
  MAX_COMMENT_LENGTH,
  categoryByKey,
  formatCommunityDate,
  getAuthorAcademicLine,
  getAuthorSnapshot,
  getDisplayName,
  getPostCommentCount,
  getPostLikeCount,
} from "../lib/communityHelpers";
import SEO from '../components/SEO';

export default function CommunityPostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState(null);
  const [engagement, setEngagement] = useState({ comments: [] });
  const [savedByMe, setSavedByMe] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [reportDraft, setReportDraft] = useState(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isGuest = !user?.uid;

  const category = categoryByKey[post?.category] || categoryByKey.general;
  const academicLine = getAuthorAcademicLine(post || {});
  const likeCount = getPostLikeCount(post || {}, engagement);
  const commentCount = getPostCommentCount(post || {}, engagement);
  const canManagePost = post && (user?.uid === post.authorId || isCommunityAdmin);
  const questionStatus = post?.category === "questions" ? (post.isAnswered ? "Answered" : "Unanswered") : "";

  const commentsEngagement = useMemo(
    () => ({
      ...engagement,
      commentCount,
    }),
    [commentCount, engagement]
  );

  useEffect(() => {
    if (!postId) {
      setPost(null);
      setLoading(false);
      return undefined;
    }

    const postRef = doc(db, "communityPosts", postId);

    return onSnapshot(
      postRef,
      (snapshot) => {
        setPost(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
        setError("");
      },
      (postError) => {
        console.error("Failed to load community post", postError);
        setError("That community post could not load right now.");
        setLoading(false);
      }
    );
  }, [postId]);

  useEffect(() => {
    if (!postId) {
      return undefined;
    }

    const commentsQuery = query(
      collection(db, "communityPosts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(commentsQuery, (snapshot) => {
      setEngagement((current) => ({
        ...current,
        comments: snapshot.docs.map((commentDoc) => ({
          id: commentDoc.id,
          ...commentDoc.data(),
        })),
      }));
    });
  }, [postId]);

  useEffect(() => {
    if (!user?.uid || !postId) {
      setSavedByMe(false);
      setUserProfile(null);
      setIsCommunityAdmin(false);
      setEngagement((current) => ({ ...current, likedByMe: false }));
      return undefined;
    }

    const profileUnsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setUserProfile(snapshot.exists() ? snapshot.data() : null);
    });
    const adminUnsubscribe = onSnapshot(doc(db, "communityAdmins", user.uid), (snapshot) => {
      setIsCommunityAdmin(snapshot.exists() || isAdmin);
    });
    const likeUnsubscribe = onSnapshot(doc(db, "communityPosts", postId, "likes", user.uid), (snapshot) => {
      setEngagement((current) => ({ ...current, likedByMe: snapshot.exists() }));
    });
    const savedUnsubscribe = onSnapshot(doc(db, "users", user.uid, "savedCommunityPosts", postId), (snapshot) => {
      setSavedByMe(snapshot.exists());
    });

    return () => {
      profileUnsubscribe();
      adminUnsubscribe();
      likeUnsubscribe();
      savedUnsubscribe();
    };
  }, [postId, user?.uid, isAdmin]);

  const addNotificationToBatch = (batch, targetPost, type, extra = {}) => {
    if (!targetPost.authorId || targetPost.authorId === user?.uid) {
      return;
    }

    const notificationRef = doc(collection(db, "users", targetPost.authorId, "notifications"));

    batch.set(notificationRef, {
      recipientId: targetPost.authorId,
      actorId: user.uid,
      actorName: getDisplayName(user),
      actorPhotoURL: userProfile?.photoURL || user.photoURL || "",
      type,
      postId: targetPost.id,
      postPreview: String(targetPost.content || "").slice(0, 160),
      commentId: "",
      commentPreview: "",
      read: false,
      createdAt: serverTimestamp(),
      ...extra,
    });
  };

  const handleToggleLike = async () => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    if (!post) {
      return;
    }

    const likeRef = doc(db, "communityPosts", post.id, "likes", user.uid);
    const postRef = doc(db, "communityPosts", post.id);
    const batch = writeBatch(db);

    try {
      if (engagement.likedByMe) {
        batch.delete(likeRef);
        if (likeCount > 0) {
          batch.update(postRef, {
            likeCount: increment(-1),
            lastActivityAt: serverTimestamp(),
          });
        }
      } else {
        batch.set(likeRef, {
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
        batch.update(postRef, {
          likeCount: increment(1),
          lastActivityAt: serverTimestamp(),
        });
        addNotificationToBatch(batch, post, "like");
      }

      await batch.commit();
    } catch (likeError) {
      console.error("Failed to update like", likeError);
      setError("Your reaction could not be saved.");
    }
  };

  const handleToggleSave = async () => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    if (!post) {
      return;
    }

    const savedRef = doc(db, "users", user.uid, "savedCommunityPosts", post.id);
    const postRef = doc(db, "communityPosts", post.id);
    const batch = writeBatch(db);

    try {
      if (savedByMe) {
        batch.delete(savedRef);
        if ((post.saveCount || 0) > 0) {
          batch.update(postRef, {
            saveCount: increment(-1),
            lastActivityAt: serverTimestamp(),
          });
        }
      } else {
        const savedPayload = {
          postId: post.id,
          authorId: post.authorId || "",
          authorName: post.authorName || "Gradiate Student",
          category: post.category || "general",
          contentPreview: String(post.content || "").slice(0, 180),
          isAnswered: Boolean(post.isAnswered),
          savedAt: serverTimestamp(),
        };

        if (post.createdAt) {
          savedPayload.createdAt = post.createdAt;
        }

        if (post.moduleCode) {
          savedPayload.moduleCode = post.moduleCode;
        }

        batch.set(savedRef, savedPayload);
        batch.update(postRef, {
          saveCount: increment(1),
          lastActivityAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (saveError) {
      console.error("Failed to update saved post", saveError);
      setError("That post could not be saved right now.");
    }
  };

  const handleCreateComment = async () => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    if (!post || !commentDraft.trim()) {
      return;
    }

    const content = commentDraft.trim().slice(0, MAX_COMMENT_LENGTH);
    const batch = writeBatch(db);
    const commentRef = doc(collection(db, "communityPosts", post.id, "comments"));
    const authorSnapshot = getAuthorSnapshot(user, userProfile || {}, isAdmin);

    setBusyPostId(post.id);
    setError("");

    try {
      batch.set(commentRef, {
        ...authorSnapshot,
        content,
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, "communityPosts", post.id), {
        commentCount: increment(1),
        lastActivityAt: serverTimestamp(),
      });
      addNotificationToBatch(batch, post, "comment", {
        commentId: commentRef.id,
        commentPreview: content.slice(0, 160),
      });

      await batch.commit();
      setCommentDraft("");
    } catch (commentError) {
      console.error("Failed to create comment", commentError);
      setError("Your comment could not be posted.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleDeleteComment = async (targetPost, commentId) => {
    if (!user?.uid || !targetPost || busyPostId) {
      return;
    }

    const batch = writeBatch(db);
    setBusyPostId(targetPost.id);

    try {
      batch.delete(doc(db, "communityPosts", targetPost.id, "comments", commentId));
      if (commentCount > 0) {
        batch.update(doc(db, "communityPosts", targetPost.id), {
          commentCount: increment(-1),
          lastActivityAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (deleteError) {
      console.error("Failed to delete comment", deleteError);
      setError("That comment could not be removed.");
    } finally {
      setBusyPostId("");
    }
  };

  const deletePostWithChildren = async (targetPostId) => {
    const postRef = doc(db, "communityPosts", targetPostId);
    const [likesSnapshot, commentsSnapshot] = await Promise.all([
      getDocs(collection(db, "communityPosts", targetPostId, "likes")),
      getDocs(collection(db, "communityPosts", targetPostId, "comments")),
    ]);
    const cleanupBatch = writeBatch(db);

    likesSnapshot.docs.forEach((likeDoc) => cleanupBatch.delete(likeDoc.ref));
    commentsSnapshot.docs.forEach((commentDoc) => cleanupBatch.delete(commentDoc.ref));

    await cleanupBatch.commit();
    await deleteDoc(postRef);
  };

  const handleDeletePost = async () => {
    if (!post || !canManagePost || busyPostId) {
      return;
    }

    if (!window.confirm("Delete this community post?")) {
      return;
    }

    setBusyPostId(post.id);
    setError("");

    try {
      await deletePostWithChildren(post.id);
      navigate(routes.community);
    } catch (deleteError) {
      console.error("Failed to delete community post", deleteError);
      setError("That post could not be removed.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleMarkAnswer = async (targetPost, comment) => {
    if (!user?.uid || !targetPost || (user.uid !== targetPost.authorId && !isCommunityAdmin)) {
      return;
    }

    setBusyPostId(targetPost.id);

    try {
      await updateDoc(doc(db, "communityPosts", targetPost.id), {
        isAnswered: true,
        acceptedCommentId: comment.id,
        acceptedAnswerPreview: String(comment.content || "").slice(0, 180),
        acceptedAnswerAuthorId: comment.authorId || "",
        acceptedAnswerAuthorName: comment.authorName || "Student",
        answeredAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      });
    } catch (answerError) {
      console.error("Failed to mark answer", answerError);
      setError("That answer could not be marked right now.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleToggleOfficial = async () => {
    if (!post || !isCommunityAdmin) {
      return;
    }

    await updateDoc(doc(db, "communityPosts", post.id), {
      isOfficial: !post.isOfficial,
      updatedAt: serverTimestamp(),
    });
  };

  const handleTogglePinned = async () => {
    if (!post || !isCommunityAdmin) {
      return;
    }

    await updateDoc(doc(db, "communityPosts", post.id), {
      pinned: !post.pinned,
      pinnedAt: post.pinned ? null : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const openReportModal = ({ targetType, post: targetPost, comment = null }) => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    setReportDraft({ targetType, post: targetPost, comment });
  };

  const submitReport = async (reason) => {
    if (!reportDraft || !user?.uid) {
      return;
    }

    const { targetType, post: targetPost, comment = null } = reportDraft;
    const cleanReason = String(reason || "").trim();

    if (!cleanReason) {
      return;
    }

    const targetId = comment?.id || targetPost.id;
    const reportRef = doc(db, "communityReports", `${targetType}_${targetPost.id}_${targetId}_${user.uid}`);

    setReportSubmitting(true);
    setError("");

    try {
      await setDoc(reportRef, {
        reporterId: user.uid,
        reporterName: getDisplayName(user),
        targetType,
        targetId,
        postId: targetPost.id,
        commentId: comment?.id || "",
        targetAuthorId: comment?.authorId || targetPost.authorId || "",
        reason: cleanReason.slice(0, 280),
        contentPreview: String(comment?.content || targetPost.content || "").slice(0, REPORT_PREVIEW_LENGTH),
        status: "open",
        createdAt: serverTimestamp(),
      });
      setReportDraft(null);
      setError("Report sent. Thanks for helping keep the community useful.");
    } catch (reportError) {
      console.error("Failed to report community content", reportError);
      setError("That report could not be sent, or you may have already reported it.");
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="dashboard-page community-page community-detail-page">
        <div className="community-detail-shell">
          <div className="community-empty">Loading post...</div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="dashboard-page community-page community-detail-page">
        <div className="community-detail-shell">
          <Link className="community-soft-button" to={routes.community}>
            <FaArrowLeft /> Back to Community
          </Link>
          <div className="community-empty">This community post was not found.</div>
        </div>
      </main>
    );
  }

  return (
    <>
      <SEO
        title={post ? `${String(post.content || '').slice(0, 60).trim()}${post.content?.length > 60 ? '...' : ''}` : 'Community Post'}
        canonical={`/community/post/${postId}`}
        description={post ? String(post.content || '').slice(0, 160).trim() : 'Student discussion on Gradiate Community.'}
        type="article"
      />
      <nav className="navbar-responsive">
        <div className="navbar-container">
          <a className="logo" href="#" style={{ fontWeight: 700, fontSize: "1.5rem", color: "#2c3e50", textDecoration: "none" }}>
            Grad<span style={{ color: "#3498db" }}>iate</span>
          </a>
          <Link className="community-soft-button" to={routes.community}>
            <FaArrowLeft /> Back to Community
          </Link>
        </div>
      </nav>

      <main className="dashboard-page community-page community-detail-page">
        <section className="community-detail-shell">
          {error && <p className="community-alert">{error}</p>}

          <article className="community-post community-post--detail">
            <div className="community-post__header">
              <div className="community-author">
                <CommunityAvatar
                  name={post.authorName}
                  photoURL={post.authorPhotoURL}
                  avatarSeed={post.authorAvatarSeed}
                  avatarStyle={post.authorAvatarStyle}
                />
                <div>
                  <h3>
                    {post.authorName || "Gradiate Student"}
                    {post.authorIsAdmin && <AdminBadge />}
                  </h3>
                  <p>{formatCommunityDate(post.createdAt)}</p>
                  {academicLine && <small className="community-author__academic">{academicLine}</small>}
                </div>
              </div>

              <div className="community-post__meta">
                {post.pinned && (
                  <span className="community-status-badge community-status-badge--pinned">
                    <FaThumbtack /> Pinned
                  </span>
                )}
                {post.isOfficial && (
                  <span className="community-status-badge community-status-badge--official">
                    <FaBullhorn /> Official Gradiate
                  </span>
                )}
                <span className={`community-category-pill community-category-pill--${category.tone}`}>
                  {category.label}
                </span>
                {post.moduleCode && <span className="community-module-badge">{post.moduleCode}</span>}
                {questionStatus && (
                  <span
                    className={`community-answer-badge ${
                      post.isAnswered ? "community-answer-badge--answered" : "community-answer-badge--unanswered"
                    }`}
                  >
                    {questionStatus}
                  </span>
                )}
              </div>
            </div>

            <p className="community-post__content">{post.content}</p>

            <div className="community-post__actions">
              <button
                className={`community-action ${engagement.likedByMe ? "community-action--liked" : ""}`}
                onClick={handleToggleLike}
                type="button"
              >
                {engagement.likedByMe ? <FaHeart /> : <FaRegHeart />}
                {likeCount}
              </button>
              <span className="community-action community-action--static">
                <FaCommentDots /> {commentCount}
              </span>
              <button className="community-action" onClick={handleToggleSave} type="button">
                {savedByMe ? <FaBookmark /> : <FaRegBookmark />}
                {savedByMe ? "Saved" : "Save"}
              </button>
              {!isGuest && user?.uid !== post.authorId && (
                <button className="community-action" onClick={() => openReportModal({ targetType: "post", post })} type="button">
                  <FaFlag /> Report
                </button>
              )}
              {isCommunityAdmin && (
                <button className="community-action" onClick={handleToggleOfficial} type="button">
                  <FaBullhorn /> {post.isOfficial ? "Unofficial" : "Official"}
                </button>
              )}
              {isCommunityAdmin && (
                <button className="community-action" onClick={handleTogglePinned} type="button">
                  <FaThumbtack /> {post.pinned ? "Unpin" : "Pin"}
                </button>
              )}
              {canManagePost && (
                <button className="community-action" onClick={handleDeletePost} type="button">
                  <FaTrash /> Delete
                </button>
              )}
            </div>

            {post.isAnswered && post.acceptedAnswerPreview && (
              <div className="community-accepted-summary">
                <FaCheck />
                <div>
                  <strong>Accepted answer from {post.acceptedAnswerAuthorName || "Student"}</strong>
                  <p>{post.acceptedAnswerPreview}</p>
                </div>
              </div>
            )}

            <CommunityComments
              post={post}
              engagement={commentsEngagement}
              alwaysExpanded
              isExpanded
              isGuest={isGuest}
              user={user}
              isCommunityAdmin={isCommunityAdmin}
              busyPostId={busyPostId}
              draft={commentDraft}
              onToggleComments={() => undefined}
              onDraftChange={(_, value) => setCommentDraft(value.slice(0, MAX_COMMENT_LENGTH))}
              onCreateComment={handleCreateComment}
              onDeleteComment={handleDeleteComment}
              onReport={openReportModal}
              onMarkAnswer={handleMarkAnswer}
            />
          </article>
        </section>
      </main>

      <CommunityReportModal
        reportDraft={reportDraft}
        submitting={reportSubmitting}
        onClose={() => setReportDraft(null)}
        onSubmit={submitReport}
      />
    </>
  );
}
